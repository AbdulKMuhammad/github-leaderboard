// config.js - Centralized configuration for Elo leaderboard system

module.exports = {
  // Starting Elo rating for new contributors
  STARTING_ELO: 1200,
  
  // K-factor thresholds (determines rating volatility)
  K_FACTORS: {
    NEW_CONTRIBUTOR_THRESHOLD: 10,      // PRs before becoming "regular"
    VETERAN_THRESHOLD: 50,              // PRs before becoming "veteran"
    NEW_CONTRIBUTOR_K: 32,              // High volatility for new people
    REGULAR_CONTRIBUTOR_K: 24,          // Medium volatility
    VETERAN_K: 16                       // Low volatility for experienced
  },
  
  // Task difficulty base ratings
  TASK_DIFFICULTY: {
    'bug': 1000,
    'enhancement': 1200,
    'feature': 1300,
    'refactor': 1300,
    'documentation': 1100,
    'critical': 1500,
    'architecture': 1500,
    'technical-debt': 1250,
    'hotfix': 1400,
    'test': 1050,
    'ci-cd': 1200,
    'security': 1450,
    'performance': 1350,
    'ui-ux': 1250
  },
  
  // Code change multipliers
  CODE_CHANGES: {
    LARGE_CHANGE_THRESHOLD: 1000,       // Lines changed
    LARGE_CHANGE_BONUS: 100,
    MEDIUM_CHANGE_THRESHOLD: 500,
    MEDIUM_CHANGE_BONUS: 50,
    MANY_FILES_THRESHOLD: 20,           // Files changed
    MANY_FILES_BONUS: 50,
    MODERATE_FILES_THRESHOLD: 10,
    MODERATE_FILES_BONUS: 25
  },
  
  // Quality multiplier settings
  QUALITY_MULTIPLIERS: {
    CLEAN_APPROVAL_BONUS: 0.15,         // No changes requested
    MULTI_APPROVAL_BONUS: 0.10,         // 2+ approvals
    LINKED_ISSUE_BONUS: 0.05,           // Per linked issue
    CLEAN_COMMITS_BONUS: 0.05,          // ≤3 commits
    CLEAN_COMMITS_THRESHOLD: 3,
    GOOD_REVIEW_RATIO_BONUS: 0.05,      // Balanced review discussion
    
    CHANGES_REQUESTED_PENALTY: 0.10,    // Per change request
    MANY_COMMITS_PENALTY: 0.05,         // >10 commits
    MANY_COMMITS_THRESHOLD: 10,
    
    MIN_MULTIPLIER: 0.5,                // Minimum quality multiplier
    MAX_MULTIPLIER: 1.5                 // Maximum quality multiplier
  },
  
  // Time-based bonuses/penalties
  TIME_BONUSES: {
    VERY_FAST_THRESHOLD: 2,             // Hours
    VERY_FAST_MULTIPLIER: 0.9,          // Slight penalty (might be rushed)
    FAST_THRESHOLD: 24,
    FAST_MULTIPLIER: 1.1,               // Bonus for same-day
    MODERATE_THRESHOLD: 72,
    MODERATE_MULTIPLIER: 1.05,          // Small bonus for 3 days
    SLOW_THRESHOLD: 168,                // 1 week
    SLOW_MULTIPLIER: 0.95               // Slight penalty
  },
  
  // Rank titles configuration
  RANK_TITLES: [
    '👑 Grand Master',
    '⭐ Master',
    '💎 Diamond',
    '🥇 Gold',
    '🥈 Silver',
    '🥉 Bronze',
    '📈 Rising Star',
    '🌱 Contributor'
  ],
  
  // Leaderboard settings
  LEADERBOARD: {
    MAX_RECENT_PRS: 10,                 // Number of recent PRs to store per contributor
    RECENT_ACTIVITY_COUNT: 5,           // Number of recent PRs to show in markdown
    LEADERBOARD_JSON_FILE: 'leaderboard.json',
    LEADERBOARD_MD_FILE: 'leaderboard.md'
  },
  
  // Review complexity threshold
  REVIEW_COMPLEXITY: {
    HIGH_COMMENT_THRESHOLD: 10,         // Review comments
    HIGH_COMMENT_BONUS: 30
  },
  
  // Feature flags
  FEATURES: {
    POST_PR_COMMENT: true,              // Post Elo update as PR comment
    GENERATE_MARKDOWN: true,            // Generate markdown leaderboard
    TRACK_RECENT_PRS: true,             // Store recent PR history
    VERBOSE_LOGGING: true               // Detailed console output
  }
};