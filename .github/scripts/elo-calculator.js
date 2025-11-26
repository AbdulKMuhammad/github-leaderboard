// elo-calculator.js - Elo rating system for GitHub contributions

const STARTING_ELO = 1200;
const LEADERBOARD_FILE = 'leaderboard.json';
const LEADERBOARD_MD = 'leaderboard.md';

// Difficulty ratings for different types of work
const TASK_DIFFICULTY = {
  'bug': 1000,
  'enhancement': 1200,
  'feature': 1300,
  'refactor': 1300,
  'documentation': 1100,
  'critical': 1500,
  'architecture': 1500,
  'technical-debt': 1250,
  'hotfix': 1400
};

// K-factor determines how much ratings change
function getKFactor(contributionCount) {
  if (contributionCount < 10) return 32;  // New contributors - high volatility
  if (contributionCount < 50) return 24;  // Regular contributors
  return 16;  // Veterans - stable ratings
}

// Calculate expected score (probability of success)
function expectedScore(playerRating, opponentRating) {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

// Determine task difficulty based on PR metadata
function calculateTaskDifficulty(prData) {
  let baseRating = 0;
  let foundLabel = false;
  
  // Check labels for difficulty indicators
  // Handle both string arrays and GitHub label objects
  const labels = prData.labels.map(l => {
    if (typeof l === 'string') {
      return l.toLowerCase();
    } else if (l.name) {
      return l.name.toLowerCase();
    }
    return '';
  });
  
  for (const label of labels) {
    for (const [key, rating] of Object.entries(TASK_DIFFICULTY)) {
      // Check for exact match or if label contains the key
      if (label === key || label.includes(key)) {
        baseRating = Math.max(baseRating, rating);
        foundLabel = true;
      }
    }
  }
  
  // Default to 1200 if no recognized labels
  if (!foundLabel) {
    baseRating = 1200;
  }
  
  // Adjust based on code changes
  const totalChanges = prData.additions + prData.deletions;
  if (totalChanges > 1000) {
    baseRating += 100;
  } else if (totalChanges > 500) {
    baseRating += 50;
  }
  
  // Adjust based on files changed
  if (prData.changed_files > 20) {
    baseRating += 50;
  } else if (prData.changed_files > 10) {
    baseRating += 25;
  }
  
  // Adjust based on review complexity
  if (prData.review_comments > 10) {
    baseRating += 30;
  }
  
  return baseRating;
}

// Calculate quality multiplier based on PR metrics
function calculateQualityMultiplier(prData) {
  let multiplier = 1.0;
  
  // Strong approval without changes
  if (prData.approved_reviews > 0 && prData.changes_requested === 0) {
    multiplier += 0.15;
  }
  
  // Multiple approvals indicate high quality
  if (prData.approved_reviews >= 2) {
    multiplier += 0.1;
  }
  
  // Changes requested reduces multiplier slightly
  if (prData.changes_requested > 0) {
    multiplier -= 0.1 * prData.changes_requested;
  }
  
  // Linked issues indicate proper ticket tracking
  if (prData.linked_issues > 0) {
    multiplier += 0.05 * prData.linked_issues;
  }
  
  // Reasonable number of commits (not too many, suggests clean work)
  if (prData.commits <= 3) {
    multiplier += 0.05;
  } else if (prData.commits > 10) {
    multiplier -= 0.05;
  }
  
  // Good code-to-comment ratio in review
  if (prData.review_comments > 0 && prData.additions > 0) {
    const commentRatio = prData.review_comments / (prData.additions / 100);
    if (commentRatio > 0.5 && commentRatio < 3) {
      multiplier += 0.05;
    }
  }
  
  // Cap multiplier between 0.5 and 1.5
  return Math.max(0.5, Math.min(1.5, multiplier));
}

// Calculate time bonus (faster completion)
function calculateTimeBonus(prData) {
  const createdAt = new Date(prData.created_at);
  const mergedAt = new Date(prData.merged_at);
  const hoursToMerge = (mergedAt - createdAt) / (1000 * 60 * 60);
  
  // Bonus for quick turnaround (but not too quick, which might indicate rushed work)
  if (hoursToMerge < 2) {
    return 0.9; // Slightly penalize very quick merges
  } else if (hoursToMerge < 24) {
    return 1.1; // Bonus for same-day completion
  } else if (hoursToMerge < 72) {
    return 1.05; // Small bonus for within 3 days
  } else if (hoursToMerge > 168) { // More than a week
    return 0.95; // Slight penalty for very long PRs
  }
  
  return 1.0;
}

// Load existing leaderboard
function loadLeaderboard() {
  try {
    const fs = require('fs');
    if (fs.existsSync(LEADERBOARD_FILE)) {
      return JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
    }
  } catch (error) {
    console.log('Creating new leaderboard');
  }
  
  return {
    contributors: {},
    lastUpdated: new Date().toISOString(),
    totalPRs: 0
  };
}

// Save leaderboard
function saveLeaderboard(leaderboard) {
  const fs = require('fs');
  
  // Update timestamp
  leaderboard.lastUpdated = new Date().toISOString();
  
  // Save JSON
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2));
  
  // Generate markdown
  generateMarkdownLeaderboard(leaderboard);
}

// Generate human-readable markdown leaderboard
function generateMarkdownLeaderboard(leaderboard) {
  const fs = require('fs');
  
  // Sort contributors by Elo rating
  const sorted = Object.entries(leaderboard.contributors)
    .sort(([, a], [, b]) => b.elo - a.elo);
  
  let markdown = '# 🏆 Contribution Leaderboard\n\n';
  markdown += `*Last updated: ${new Date(leaderboard.lastUpdated).toLocaleString()}*\n\n`;
  markdown += `**Total PRs tracked:** ${leaderboard.totalPRs}\n\n`;
  
  // Rank titles
  const titles = [
    '👑 Grand Master',
    '⭐ Master',
    '💎 Diamond',
    '🥇 Gold',
    '🥈 Silver',
    '🥉 Bronze',
    '📈 Rising Star',
    '🌱 Contributor'
  ];
  
  markdown += '| Rank | Contributor | Elo Rating | PRs | Avg Difficulty | Title |\n';
  markdown += '|------|-------------|------------|-----|----------------|-------|\n';
  
  sorted.forEach(([username, data], index) => {
    const rank = index + 1;
    const title = titles[Math.min(index, titles.length - 1)];
    const avgDifficulty = Math.round(data.totalDifficulty / data.prs);
    
    markdown += `| ${rank} | [@${username}](https://github.com/${username}) | ` +
                `${Math.round(data.elo)} | ${data.prs} | ${avgDifficulty} | ${title} |\n`;
  });
  
  markdown += '\n## 📊 Stats Explained\n\n';
  markdown += '- **Elo Rating**: Your skill rating (starts at 1200)\n';
  markdown += '- **PRs**: Number of merged pull requests\n';
  markdown += '- **Avg Difficulty**: Average complexity of tasks you tackle\n\n';
  
  markdown += '## 🎯 How It Works\n\n';
  markdown += '- Ratings increase when you complete challenging tasks\n';
  markdown += '- Quality matters: Clean code with good reviews earns bonus points\n';
  markdown += '- Speed counts: Timely PRs get a small boost\n';
  markdown += '- Collaboration is rewarded: Linked issues and review engagement help\n\n';
  
  markdown += '## 🏅 Recent Activity\n\n';
  
  // Show last 5 PRs
  const recentPRs = [];
  for (const [username, data] of Object.entries(leaderboard.contributors)) {
    if (data.recentPRs) {
      data.recentPRs.forEach(pr => {
        recentPRs.push({ username, ...pr });
      });
    }
  }
  
  recentPRs.sort((a, b) => new Date(b.mergedAt) - new Date(a.mergedAt));
  recentPRs.slice(0, 5).forEach(pr => {
    markdown += `- **${pr.username}** completed [#${pr.number}](${pr.url}) ` +
                `(+${pr.eloChange} Elo) - ${pr.title}\n`;
  });
  
  fs.writeFileSync(LEADERBOARD_MD, markdown);
}

// Main update function
async function updateLeaderboard(github, context, prData) {
  const leaderboard = loadLeaderboard();
  const author = prData.author;
  
  // Initialize contributor if new
  if (!leaderboard.contributors[author]) {
    leaderboard.contributors[author] = {
      elo: STARTING_ELO,
      prs: 0,
      totalDifficulty: 0,
      recentPRs: []
    };
  }
  
  const contributor = leaderboard.contributors[author];
  
  // Calculate task difficulty
  const taskDifficulty = calculateTaskDifficulty(prData);
  
  // Calculate expected and actual scores
  const expected = expectedScore(contributor.elo, taskDifficulty);
  const actual = 1; // PR was merged, so success = 1
  
  // Get K-factor
  const kFactor = getKFactor(contributor.prs);
  
  // Calculate quality multiplier
  const qualityMultiplier = calculateQualityMultiplier(prData);
  
  // Calculate time bonus
  const timeBonus = calculateTimeBonus(prData);
  
  // Calculate Elo change
  const baseEloChange = kFactor * (actual - expected);
  const finalEloChange = Math.round(baseEloChange * qualityMultiplier * timeBonus);
  
  // Update contributor stats
  contributor.elo += finalEloChange;
  contributor.prs += 1;
  contributor.totalDifficulty += taskDifficulty;
  
  // Store recent PR info (keep last 10)
  if (!contributor.recentPRs) {
    contributor.recentPRs = [];
  }
  
  contributor.recentPRs.unshift({
    number: prData.number,
    title: prData.title,
    eloChange: finalEloChange,
    difficulty: taskDifficulty,
    mergedAt: prData.merged_at,
    url: `https://github.com/${context.repo.owner}/${context.repo.repo}/pull/${prData.number}`
  });
  
  contributor.recentPRs = contributor.recentPRs.slice(0, 10);
  
  // Update global stats
  leaderboard.totalPRs += 1;
  
  // Save updated leaderboard
  saveLeaderboard(leaderboard);
  
  // Post comment on PR
  const rank = Object.values(leaderboard.contributors)
    .filter(c => c.elo > contributor.elo).length + 1;
  
  const commentBody = `## 🎮 Elo Update\n\n` +
    `**${author}** earned **${finalEloChange > 0 ? '+' : ''}${finalEloChange}** Elo points!\n\n` +
    `- Current Rating: **${Math.round(contributor.elo)}** (Rank #${rank})\n` +
    `- Task Difficulty: ${Math.round(taskDifficulty)}\n` +
    `- Quality Multiplier: ${qualityMultiplier.toFixed(2)}x\n` +
    `- Time Bonus: ${timeBonus.toFixed(2)}x\n\n` +
    `[View Full Leaderboard](${context.payload.repository.html_url}/blob/main/leaderboard.md)`;
  
  try {
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: prData.number,
      body: commentBody
    });
  } catch (error) {
    console.error('Failed to post comment:', error);
  }
  
  console.log(`Updated Elo for ${author}: ${contributor.elo} (${finalEloChange > 0 ? '+' : ''}${finalEloChange})`);
}

// Export for use in other modules (like tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateLeaderboard,
    calculateTaskDifficulty,
    calculateQualityMultiplier,
    calculateTimeBonus,
    expectedScore,
    getKFactor,
    loadLeaderboard,
    saveLeaderboard
  };
}

// Make functions available in global scope for GitHub Actions eval()
if (typeof global !== 'undefined') {
  global.updateLeaderboard = updateLeaderboard;
  global.calculateTaskDifficulty = calculateTaskDifficulty;
  global.calculateQualityMultiplier = calculateQualityMultiplier;
  global.calculateTimeBonus = calculateTimeBonus;
  global.expectedScore = expectedScore;
  global.getKFactor = getKFactor;
}