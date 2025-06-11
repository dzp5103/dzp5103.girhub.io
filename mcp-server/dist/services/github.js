/**
 * GitHub API Client with Rate Limiting and Request Queuing
 */
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { EventEmitter } from 'events';
import { configManager } from '../config/index.js';
import { logger } from '../utils/logger.js';
export class GitHubClient extends EventEmitter {
    octokit;
    rateLimiter = null;
    requestQueue = [];
    isProcessingQueue = false;
    maxRetries = 3;
    retryDelay = 1000;
    constructor(options = {}) {
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
        }
        else {
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
    setupEventHandlers() {
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
                }
                catch (rateLimitError) {
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
    extractRateLimit(headers) {
        return {
            limit: parseInt(headers['x-ratelimit-limit'] || '0', 10),
            remaining: parseInt(headers['x-ratelimit-remaining'] || '0', 10),
            reset: parseInt(headers['x-ratelimit-reset'] || '0', 10),
            used: parseInt(headers['x-ratelimit-used'] || '0', 10),
            resource: headers['x-ratelimit-resource'] || 'core',
        };
    }
    async executeWithRetry(operation, context) {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
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
                        error: error.message,
                    });
                    await this.sleep(delay);
                    continue;
                }
                // Non-retryable error, throw immediately
                throw error;
            }
        }
        throw lastError;
    }
    isRetryableError(error) {
        if (!error || typeof error !== 'object')
            return false;
        const status = error.status || error.response?.status;
        // Retry on server errors and some client errors
        return status >= 500 || status === 429 || status === 502 || status === 503 || status === 504;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Core API methods
    async getUser(username) {
        return this.executeWithRetry(async () => {
            const response = await this.octokit.users.getByUsername({ username });
            return response.data;
        }, `getUser(${username})`);
    }
    async getUserRepositories(username, options = {}) {
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
    async getRepository(owner, repo) {
        return this.executeWithRetry(async () => {
            const response = await this.octokit.repos.get({ owner, repo });
            return response.data;
        }, `getRepository(${owner}/${repo})`);
    }
    async getRepositoryLanguages(owner, repo) {
        return this.executeWithRetry(async () => {
            const response = await this.octokit.repos.listLanguages({ owner, repo });
            return response.data;
        }, `getRepositoryLanguages(${owner}/${repo})`);
    }
    async getRepositoryContributors(owner, repo) {
        return this.executeWithRetry(async () => {
            const response = await this.octokit.repos.listContributors({ owner, repo });
            return response.data;
        }, `getRepositoryContributors(${owner}/${repo})`);
    }
    async getRepositoryCommits(owner, repo, options = {}) {
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
    async getRepositoryContent(owner, repo, path, ref) {
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
    async getUserProfile(username) {
        const user = await this.getUser(username);
        const repositories = await this.getUserRepositories(username, { per_page: 100 });
        // Calculate aggregate statistics
        const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        const totalForks = repositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
        // Get language statistics across all repositories
        const languageStats = {};
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
            }
            catch (error) {
                logger.warn(`Failed to get languages for ${repo.full_name}`, { error });
            }
        }
        // Get recent activity (commits from recent repositories)
        const recentActivity = [];
        for (const repo of repositories.slice(0, 3)) {
            try {
                const commits = await this.getRepositoryCommits(repo.owner.login, repo.name, {
                    author: username,
                    per_page: 10,
                });
                recentActivity.push(...commits);
            }
            catch (error) {
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
    async getRepositoryStats(owner, repo) {
        const [repository, languages, contributors, commits] = await Promise.allSettled([
            this.getRepository(owner, repo),
            this.getRepositoryLanguages(owner, repo),
            this.getRepositoryContributors(owner, repo),
            this.getRepositoryCommits(owner, repo, { per_page: 100 }),
        ]);
        return {
            repository: repository.status === 'fulfilled' ? repository.value : {},
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
    async getRateLimit() {
        const response = await this.octokit.rateLimit.get();
        return response.data.rate;
    }
    // Health check
    async isHealthy() {
        try {
            await this.octokit.meta.get();
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
// Export singleton factory
export function createGitHubClient(options = {}) {
    return new GitHubClient(options);
}
