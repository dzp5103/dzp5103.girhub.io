/**
 * Stats Generator Plugin - Example MCP Plugin
 * Demonstrates how to create custom tools and resources
 */

export default function createStatsGeneratorPlugin() {
  return {
    metadata: {
      name: 'stats-generator',
      version: '1.0.0',
      description: 'Generate GitHub statistics and insights',
      author: 'GitHub README Transformer',
      license: 'MIT',
      keywords: ['github', 'stats', 'analytics'],
    },

    tools: [
      {
        name: 'generate_language_stats',
        description: 'Generate language statistics from GitHub user data',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'GitHub username to analyze',
            },
            includePrivate: {
              type: 'boolean',
              description: 'Include private repositories in analysis',
              default: false,
            },
          },
          required: ['username'],
        },
      },
      {
        name: 'generate_activity_summary',
        description: 'Generate activity summary for a GitHub user',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'GitHub username to analyze',
            },
            days: {
              type: 'number',
              description: 'Number of days to look back',
              default: 30,
              minimum: 1,
              maximum: 365,
            },
          },
          required: ['username'],
        },
      },
    ],

    resources: [
      {
        uri: 'stats://language-trends',
        name: 'Language Trends',
        description: 'Current programming language trends data',
        mimeType: 'application/json',
      },
      {
        uri: 'stats://contribution-patterns',
        name: 'Contribution Patterns',
        description: 'Analysis of contribution patterns',
        mimeType: 'application/json',
      },
    ],

    async onLoad(context) {
      context.logger.info('Stats Generator plugin loaded successfully');
    },

    async onEnable(context) {
      context.logger.info('Stats Generator plugin enabled');
    },

    async onDisable(context) {
      context.logger.info('Stats Generator plugin disabled');
    },

    async handleTool(call, context) {
      const { name, arguments: args } = call;

      try {
        switch (name) {
          case 'generate_language_stats':
            return await this.generateLanguageStats(args, context);
          
          case 'generate_activity_summary':
            return await this.generateActivitySummary(args, context);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        context.logger.error(`Tool execution failed: ${name}`, { error, args });
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },

    async handleResource(uri, context) {
      try {
        switch (uri) {
          case 'stats://language-trends':
            return await this.getLanguageTrends(context);
          
          case 'stats://contribution-patterns':
            return await this.getContributionPatterns(context);
          
          default:
            throw new Error(`Unknown resource: ${uri}`);
        }
      } catch (error) {
        context.logger.error(`Resource access failed: ${uri}`, { error });
        throw error;
      }
    },

    async generateLanguageStats(args, context) {
      const { username, includePrivate = false } = args;
      
      context.logger.info('Generating language stats', { username, includePrivate });

      // Mock implementation - in a real plugin, this would use the GitHub API
      const mockStats = {
        username,
        totalRepositories: 42,
        languages: {
          'JavaScript': { bytes: 125000, percentage: 35.2 },
          'TypeScript': { bytes: 98000, percentage: 27.6 },
          'Python': { bytes: 76000, percentage: 21.4 },
          'Go': { bytes: 45000, percentage: 12.7 },
          'Rust': { bytes: 11000, percentage: 3.1 },
        },
        mostUsedLanguage: 'JavaScript',
        diversityScore: 0.78,
        analysis: {
          primaryFocus: 'Web Development',
          skillLevel: 'Advanced',
          trendingLanguages: ['TypeScript', 'Go'],
        },
        lastUpdated: new Date().toISOString(),
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockStats, null, 2),
          },
        ],
      };
    },

    async generateActivitySummary(args, context) {
      const { username, days = 30 } = args;
      
      context.logger.info('Generating activity summary', { username, days });

      // Mock implementation
      const mockSummary = {
        username,
        period: `${days} days`,
        summary: {
          totalCommits: 89,
          totalPullRequests: 12,
          totalIssues: 5,
          repositoriesContributed: 8,
          averageCommitsPerDay: Math.round((89 / days) * 10) / 10,
        },
        dailyActivity: Array.from({ length: Math.min(days, 7) }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          commits: Math.floor(Math.random() * 10),
          pullRequests: Math.floor(Math.random() * 3),
          issues: Math.floor(Math.random() * 2),
        })),
        topRepositories: [
          { name: 'awesome-project', commits: 23, language: 'TypeScript' },
          { name: 'cool-library', commits: 18, language: 'JavaScript' },
          { name: 'data-analyzer', commits: 15, language: 'Python' },
        ],
        activityScore: 87,
        lastUpdated: new Date().toISOString(),
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockSummary, null, 2),
          },
        ],
      };
    },

    async getLanguageTrends(context) {
      context.logger.info('Fetching language trends data');

      const trends = {
        trending: [
          { language: 'Rust', growth: '+15.3%', rank: 1 },
          { language: 'TypeScript', growth: '+12.7%', rank: 2 },
          { language: 'Go', growth: '+8.9%', rank: 3 },
          { language: 'Python', growth: '+6.2%', rank: 4 },
          { language: 'Kotlin', growth: '+5.8%', rank: 5 },
        ],
        declining: [
          { language: 'PHP', decline: '-3.2%', rank: 1 },
          { language: 'C++', decline: '-2.1%', rank: 2 },
          { language: 'Ruby', decline: '-1.8%', rank: 3 },
        ],
        stable: ['JavaScript', 'Java', 'C#', 'Swift'],
        lastUpdated: new Date().toISOString(),
      };

      return {
        uri: 'stats://language-trends',
        mimeType: 'application/json',
        text: JSON.stringify(trends, null, 2),
      };
    },

    async getContributionPatterns(context) {
      context.logger.info('Analyzing contribution patterns');

      const patterns = {
        patterns: {
          timeOfDay: {
            morning: 25,    // 6-12
            afternoon: 45,  // 12-18
            evening: 20,    // 18-24
            night: 10,      // 0-6
          },
          dayOfWeek: {
            monday: 18,
            tuesday: 16,
            wednesday: 14,
            thursday: 15,
            friday: 13,
            saturday: 12,
            sunday: 12,
          },
          monthlyTrend: 'increasing',
          peakActivity: 'Tuesday afternoon',
          averageSessionLength: '2.3 hours',
        },
        insights: [
          'Most productive during afternoon hours',
          'Consistent weekday activity',
          'Lower weekend activity suggests work-focused development',
          'Increasing monthly trend indicates growing engagement',
        ],
        lastUpdated: new Date().toISOString(),
      };

      return {
        uri: 'stats://contribution-patterns',
        mimeType: 'application/json',
        text: JSON.stringify(patterns, null, 2),
      };
    },
  };
}