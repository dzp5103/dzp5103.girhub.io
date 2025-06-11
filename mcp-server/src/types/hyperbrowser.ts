/**
 * Hyperbrowser API Types and Interfaces
 */

// Hyperbrowser API Response Types
export interface HyperbrowserPage {
  url: string;
  title: string;
  content: string;
  metadata?: {
    description?: string;
    keywords?: string[];
    author?: string;
    publishDate?: string;
  };
  links?: {
    href: string;
    text: string;
    type?: string;
  }[];
  images?: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  }[];
}

export interface HyperbrowserScreenshot {
  url: string;
  image: string; // Base64 encoded image
  format: 'png' | 'jpeg' | 'webp';
  width: number;
  height: number;
  timestamp: string;
}

export interface HyperbrowserBrowseOptions {
  url: string;
  waitFor?: number;
  fullPage?: boolean;
  mobile?: boolean;
  javascript?: boolean;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HyperbrowserScreenshotOptions {
  url: string;
  width?: number;
  height?: number;
  fullPage?: boolean;
  mobile?: boolean;
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  waitFor?: number;
  timeout?: number;
}

export interface HyperbrowserSearchOptions {
  query: string;
  engine?: 'google' | 'bing' | 'duckduckgo';
  limit?: number;
  lang?: string;
  region?: string;
}

export interface HyperbrowserSearchResult {
  title: string;
  url: string;
  snippet: string;
  rank: number;
  engine: string;
}

export interface HyperbrowserBatchRequest {
  urls: string[];
  options?: Omit<HyperbrowserBrowseOptions, 'url'>;
}

export interface HyperbrowserBatchResponse {
  results: {
    url: string;
    success: boolean;
    data?: HyperbrowserPage;
    error?: string;
  }[];
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
}

export interface HyperbrowserApiError {
  code: string;
  message: string;
  details?: any;
}

export interface HyperbrowserApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: HyperbrowserApiError;
  rateLimitRemaining?: number;
  rateLimitReset?: number;
}

export interface HyperbrowserRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  windowMs: number;
}

export interface HyperbrowserConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
    retryDelay: number;
  };
  rateLimit: {
    requestsPerMinute: number;
    burstLimit: number;
    windowMs: number;
  };
  defaults: {
    waitFor: number;
    timeout: number;
    javascript: boolean;
    mobile: boolean;
  };
}

export interface HyperbrowserCredentials {
  apiKey: string;
}