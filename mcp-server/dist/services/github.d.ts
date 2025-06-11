/**
 * GitHub API Client with Rate Limiting and Request Queuing
 */
import { EventEmitter } from 'events';
import { GitHubUser, GitHubRepository, GitHubCommit, GitHubContributor, GitHubLanguageStats, GitHubUserProfile, GitHubRepositoryStats, GitHubRateLimit, GitHubContent } from '../types/github.js';
export interface GitHubClientOptions {
    token?: string;
    appId?: string;
    privateKey?: string;
    installationId?: number;
    redisClient?: any;
}
export declare class GitHubClient extends EventEmitter {
    private octokit;
    private rateLimiter;
    private requestQueue;
    private isProcessingQueue;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor(options?: GitHubClientOptions);
    private setupEventHandlers;
    private extractRateLimit;
    private executeWithRetry;
    private isRetryableError;
    private sleep;
    getUser(username: string): Promise<GitHubUser>;
    getUserRepositories(username: string, options?: {
        type?: 'all' | 'owner' | 'member';
        sort?: 'created' | 'updated' | 'pushed' | 'full_name';
        direction?: 'asc' | 'desc';
        per_page?: number;
        page?: number;
    }): Promise<GitHubRepository[]>;
    getRepository(owner: string, repo: string): Promise<GitHubRepository>;
    getRepositoryLanguages(owner: string, repo: string): Promise<GitHubLanguageStats>;
    getRepositoryContributors(owner: string, repo: string): Promise<GitHubContributor[]>;
    getRepositoryCommits(owner: string, repo: string, options?: {
        sha?: string;
        path?: string;
        author?: string;
        since?: string;
        until?: string;
        per_page?: number;
        page?: number;
    }): Promise<GitHubCommit[]>;
    getRepositoryContent(owner: string, repo: string, path: string, ref?: string): Promise<GitHubContent | GitHubContent[]>;
    getUserProfile(username: string): Promise<GitHubUserProfile>;
    getRepositoryStats(owner: string, repo: string): Promise<GitHubRepositoryStats>;
    getRateLimit(): Promise<GitHubRateLimit>;
    isHealthy(): Promise<boolean>;
}
export declare function createGitHubClient(options?: GitHubClientOptions): GitHubClient;
