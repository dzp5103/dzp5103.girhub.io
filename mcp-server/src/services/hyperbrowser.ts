/**
 * Hyperbrowser API Client with Rate Limiting and Request Queuing
 */

import { EventEmitter } from 'events';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { configManager } from '../config/index.js';
import { logger } from '../utils/logger.js';
import {
  HyperbrowserPage,
  HyperbrowserScreenshot,
  HyperbrowserBrowseOptions,
  HyperbrowserScreenshotOptions,
  HyperbrowserSearchOptions,
  HyperbrowserSearchResult,
  HyperbrowserBatchRequest,
  HyperbrowserBatchResponse,
  HyperbrowserApiResponse,
  HyperbrowserRateLimit,
  HyperbrowserConfig,
  HyperbrowserCredentials,
} from '../types/hyperbrowser.js';

export interface HyperbrowserClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  redisClient?: any;
}

export class HyperbrowserClient extends EventEmitter {
  private apiKey: string;
  private config: HyperbrowserConfig;
  private rateLimiter: RateLimiterRedis | null = null;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(options: HyperbrowserClientOptions = {}) {
    super();
    
    const credentials = configManager.getHyperbrowserCredentials();
    const config = configManager.getHyperbrowserConfig();
    
    this.apiKey = options.apiKey || credentials.apiKey;
    this.config = config;

    if (!this.apiKey) {
      throw new Error('Hyperbrowser API key is required');
    }

    // Initialize rate limiter if Redis client is available
    if (options.redisClient) {
      this.rateLimiter = new RateLimiterRedis({
        storeClient: options.redisClient,
        keyPrefix: 'hyperbrowser_api_limit',
        points: config.rateLimit.requestsPerMinute,
        duration: config.rateLimit.windowMs / 1000, // Convert to seconds
        blockDuration: 60, // Block for 1 minute when rate limit exceeded
        execEvenly: true,
      });
    }

