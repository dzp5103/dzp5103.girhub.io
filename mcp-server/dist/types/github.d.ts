/**
 * GitHub API Data Types and Interfaces
 */
export interface GitHubUser {
    id: number;
    login: string;
    name?: string | null;
    email?: string | null;
    avatar_url: string;
    html_url: string;
    bio?: string | null;
    company?: string | null;
    location?: string | null;
    blog?: string | null;
    twitter_username?: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
}
export interface GitHubRepository {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    description?: string | null;
    private?: boolean;
    html_url: string;
    clone_url?: string;
    ssh_url?: string;
    homepage?: string | null;
    size?: number;
    stargazers_count?: number;
    watchers_count?: number;
    forks_count?: number;
    open_issues_count?: number;
    language?: string | null;
    topics?: string[];
    default_branch?: string;
    created_at?: string;
    updated_at?: string;
    pushed_at?: string;
    owner: Partial<GitHubUser> & {
        login: string;
        id: number;
        avatar_url: string;
        html_url: string;
    };
    license?: GitHubLicense | null;
}
export interface GitHubLicense {
    key: string;
    name: string;
    spdx_id?: string | null;
    url?: string | null;
    node_id?: string;
    html_url?: string;
}
export interface GitHubCommit {
    sha: string;
    node_id: string;
    url: string;
    html_url: string;
    commit: {
        author: {
            name?: string;
            email?: string;
            date?: string;
        } | null;
        committer: {
            name?: string;
            email?: string;
            date?: string;
        } | null;
        message: string;
        tree: {
            sha: string;
            url: string;
        };
        url: string;
        comment_count?: number;
    };
    author?: GitHubUser | null;
    committer?: GitHubUser | null;
    parents?: Array<{
        sha: string;
        url: string;
        html_url?: string;
    }>;
}
export interface GitHubContributor {
    login?: string;
    id?: number;
    avatar_url?: string;
    html_url?: string;
    contributions?: number;
    type?: string;
}
export interface GitHubLanguageStats {
    [language: string]: number;
}
export interface GitHubRepositoryStats {
    repository: GitHubRepository;
    languages: GitHubLanguageStats;
    contributors: GitHubContributor[];
    commits: GitHubCommit[];
    stars: number;
    forks: number;
    issues: number;
    pullRequests: number;
}
export interface GitHubUserProfile {
    user: GitHubUser;
    repositories: GitHubRepository[];
    totalStars: number;
    totalForks: number;
    totalCommits: number;
    languageStats: GitHubLanguageStats;
    topRepositories: GitHubRepository[];
    recentActivity: GitHubCommit[];
}
export interface GitHubRateLimit {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
    resource?: string;
}
export interface GitHubApiResponse<T = any> {
    data: T;
    status: number;
    headers: Record<string, string>;
    rateLimit: GitHubRateLimit;
}
export interface GitHubApiError {
    message: string;
    documentation_url?: string;
    errors?: Array<{
        resource: string;
        field: string;
        code: string;
    }>;
}
export interface GitHubWebhookEvent {
    action: string;
    repository?: GitHubRepository;
    sender: GitHubUser;
    installation?: {
        id: number;
    };
}
export interface GitHubSearchResult<T> {
    total_count: number;
    incomplete_results: boolean;
    items: T[];
}
export interface GitHubTreeItem {
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    size?: number;
    url: string;
}
export interface GitHubContent {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url?: string | null;
    git_url?: string | null;
    download_url?: string | null;
    type: 'file' | 'dir' | 'submodule' | 'symlink';
    content?: string;
    encoding?: string;
}
