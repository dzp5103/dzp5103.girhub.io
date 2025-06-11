/**
 * GitHub API Client with Rate Limiting and Request Queuing
 */

import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { EventEmitter } from 'events';
import { configManager } from '../config/index.js';
import { logger } from '../utils/logger.js';
import {
  GitHubUser,
  GitHubRepository,
  GitHubCommit,
  GitHubContributor,
  GitHubLanguageStats,
  GitHubUserProfile,
  GitHubRepositoryStats,
  GitHubRateLimit,
  GitHubApiResponse,
  GitHubApiError,
  GitHubContent,
} from '../types/github.js';

export interface GitHubClientOptions {
  token?: string;
  appId?: string;
  privateKey?: string;
  installationId?: number;
  redisClient?: any;
}

export class GitHubClient extends EventEmitter {
  private octokit: Octokit;
  private rateLimiter: RateLimiterRedis | null = null;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(options: GitHubClientOptions = {}) {
    super();
    
    const credentials = configManager.getGitHubCredentials();
    const config = configManager.getGitHubConfig();

    // Initialize Octokit with authentication
    if (options.appId && options.privateKey) {
      // GitHub App authentication
      this.octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: options.appId,
          privateKey: options.privateKey,
          installationId: options.installationId,
        },
        baseUrl: config.api.baseUrl,
        request: {
          timeout: config.api.timeout,
        },
      });
    } else {
      // Personal Access Token authentication
      this.octokit = new Octokit({
        auth: options.token || credentials.token,
        baseUrl: config.api.baseUrl,
        request: {
          timeout: config.api.timeout,
        },
      });
    }

    // Initialize rate limiter if Redis client is available
    if (options.redisClient) {
      this.rateLimiter = new RateLimiterRedis({
        storeClient: options.redisClient,
        keyPrefix: 'github_api_limit',
        points: config.rateLimit.requestsPerHour,
        duration: config.rateLimit.windowMs / 1000, // Convert to seconds
        blockDuration: 60, // Block for 1 minute when rate limit exceeded
        execEvenly: true,
      });
    }

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle rate limit events
    this.octokit.hook.before('request', async (options) => {
      logger.logGitHubAPICall({
        endpoint: options.url,
        method: options.method,
      });

      // Apply rate limiting if available
      if (this.rateLimiter) {
        try {
          await this.rateLimiter.consume('github_api', 1);
        } catch (rateLimitError) {
          logger.warn('GitHub API rate limit exceeded, request queued');
          this.emit('rateLimitExceeded', { endpoint: options.url });
          throw new Error('Rate limit exceeded');
        }
      }
    });

    this.octokit.hook.after('request', async (response, options) => {
      const rateLimit = this.extractRateLimit(response.headers);
      
      logger.logGitHubAPICall({
        endpoint: options.url,
        method: options.method,
        statusCode: response.status,
        rateLimit,
      });

      this.emit('apiCall', {
        endpoint: options.url,
        method: options.method,
        statusCode: response.status,
        rateLimit,
      });
    });

    this.octokit.hook.error('request', async (error, options) => {
      logger.error('GitHub API Error', {
        endpoint: options.url,
        method: options.method,
        error: error.message,
      });

      this.emit('apiError', {
        endpoint: options.url,
        method: options.method,
        error,
      });
    });
  }

  private extractRateLimit(headers: any): GitHubRateLimit {
    return {
      limit: parseInt(headers['x-ratelimit-limit'] || '0', 10),
      remaining: parseInt(headers['x-ratelimit-remaining'] || '0', 10),
      reset: parseInt(headers['x-ratelimit-reset'] || '0', 10),
      used: parseInt(headers['x-ratelimit-used'] || '0', 10),
      resource: headers['x-ratelimit-resource'] || 'core',
    };
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxRetries) {
          logger.error(`GitHub API operation failed after ${this.maxRetries} attempts`, {
            context,
            error: lastError.message,
          });
          break;
        }

        // Check if it's a rate limit error
        if (error instanceof Error && error.message.includes('rate limit')) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          logger.warn(`Rate limit hit, retrying in ${delay}ms`, { context, attempt });
          await this.sleep(delay);
          continue;
        }

        // Check if it's a temporary error
        if (this.isRetryableError(error)) {
          const delay = this.retryDelay * attempt;
          logger.warn(`Retryable error, retrying in ${delay}ms`, {
            context,
            attempt,
            error: (error as Error).message,
          });
          await this.sleep(delay);
          continue;
        }

        // Non-retryable error, throw immediately
        throw error;
      }
    }

    throw lastError!;
  }

  private isRetryableError(error: any): boolean {
    if (!error || typeof error !== 'object') return false;
    
    const status = error.status || error.response?.status;
    
    // Retry on server errors and some client errors
    return status >= 500 || status === 429 || status === 502 || status === 503 || status === 504;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Core API methods
  public async getUser(username: string): Promise<GitHubUser> {
    return this.executeWithRetry(async () => {
      const response = await this.octokit.users.getByUsername({ username });
      return response.data;
    }, `getUser(${username})`);
  }

  public async getUserRepositories(username: string, options: {
    type?: 'all' | 'owner' | 'member';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}): Promise<GitHubRepository[]> {
    return this.executeWithRetry(async () => {
      const response = await this.octokit.repos.listForUser({
        username,
        type: options.type || 'owner',
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        per_page: options.per_page || 100,
        page: options.page || 1,
      });
      return response.data;
    }, `getUserRepositories(${username})`);
  }

  public async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.executeWithRetry(async () => {
      const response = await this.octokit.repos.get({ owner, repo });
      return response.data;
    }, `getRepository(${owner}/${repo})`);
  }

  public async getRepositoryLanguages(owner: string, repo: string): Promise<GitHubLanguageStats> {
    return this.executeWithRetry(async () => {
      const response = await this.octokit.repos.listLanguages({ owner, repo });
      return response.data;
    }, `getRepositoryLanguages(${owner}/${repo})`);
  }

  public async getRepositoryContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
    return this.executeWithRetry(async () => {
      const response = await this.octokit.repos.listContributors({ owner, repo });
      return response.data;
    }, `getRepositoryContributors(${owner}/${repo})`);
  }

  public async getRepositoryCommits(owner: string, repo: string, options: {
    sha?: string;
    path?: string;
    author?: string;
    since?: string;
    until?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<GitHubCommit[]> {
    return this.executeWithRetry(async () => {
      const response = await this.octokit.repos.listCommits({
        owner,
        repo,
        ...options,
        per_page: options.per_page || 100,
        page: options.page || 1,
      });
      return response.data;
    }, `getRepositoryCommits(${owner}/${repo})`);
  }

  public async getRepositoryContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<GitHubContent | GitHubContent[]> {
    return this.executeWithRetry(async () => {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });
      return response.data;
    }, `getRepositoryContent(${owner}/${repo}/${path})`);
  }

  // High-level aggregation methods
  public async getUserProfile(username: string): Promise<GitHubUserProfile> {
    const user = await this.getUser(username);
    const repositories = await this.getUserRepositories(username, { per_page: 100 });

    // Calculate aggregate statistics
    const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = repositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);

    // Get language statistics across all repositories
    const languageStats: GitHubLanguageStats = {};
    const topRepositories = repositories
      .filter(repo => !repo.private)
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 10);

    // Aggregate language stats from top repositories
    for (const repo of topRepositories.slice(0, 5)) {
      try {
        const repoLanguages = await this.getRepositoryLanguages(repo.owner.login, repo.name);
        for (const [language, bytes] of Object.entries(repoLanguages)) {
          languageStats[language] = (languageStats[language] || 0) + bytes;
        }
      } catch (error) {
        logger.warn(`Failed to get languages for ${repo.full_name}`, { error });
      }
    }

    // Get recent activity (commits from recent repositories)
    const recentActivity: GitHubCommit[] = [];
    for (const repo of repositories.slice(0, 3)) {
      try {
        const commits = await this.getRepositoryCommits(repo.owner.login, repo.name, {
          author: username,
          per_page: 10,
        });
        recentActivity.push(...commits);
      } catch (error) {
        logger.warn(`Failed to get commits for ${repo.full_name}`, { error });
      }
    }

    // Sort recent activity by date
    recentActivity.sort((a, b) => {
      const dateA = a.commit.author?.date || '1970-01-01';
      const dateB = b.commit.author?.date || '1970-01-01';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    return {
      user,
      repositories,
      totalStars,
      totalForks,
      totalCommits: recentActivity.length, // Approximate
      languageStats,
      topRepositories,
      recentActivity: recentActivity.slice(0, 20),
    };
  }

  public async getRepositoryStats(owner: string, repo: string): Promise<GitHubRepositoryStats> {
    const [repository, languages, contributors, commits] = await Promise.allSettled([
      this.getRepository(owner, repo),
      this.getRepositoryLanguages(owner, repo),
      this.getRepositoryContributors(owner, repo),
      this.getRepositoryCommits(owner, repo, { per_page: 100 }),
    ]);

    return {
      repository: repository.status === 'fulfilled' ? repository.value : {} as GitHubRepository,
      languages: languages.status === 'fulfilled' ? languages.value : {},
      contributors: contributors.status === 'fulfilled' ? contributors.value : [],
      commits: commits.status === 'fulfilled' ? commits.value : [],
      stars: repository.status === 'fulfilled' ? (repository.value.stargazers_count || 0) : 0,
      forks: repository.status === 'fulfilled' ? (repository.value.forks_count || 0) : 0,
      issues: repository.status === 'fulfilled' ? (repository.value.open_issues_count || 0) : 0,
      pullRequests: 0, // Would need additional API call
    };
  }

  // Rate limit information
  public async getRateLimit(): Promise<GitHubRateLimit> {
    const response = await this.octokit.rateLimit.get();
    return response.data.rate;
  }

  // Health check
  public async isHealthy(): Promise<boolean> {
    try {
      await this.octokit.meta.get();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton factory
export function createGitHubClient(options: GitHubClientOptions = {}): GitHubClient {
  return new GitHubClient(options);
}