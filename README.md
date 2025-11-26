# GitHub Elo Leaderboard System 🏆

An automated leaderboard system that tracks and ranks contributors based on their merged pull requests using an Elo rating system.

## 🎯 Overview

This system automatically calculates Elo ratings for each contributor based on multiple factors:
- **Task Difficulty**: Complexity of the work (bugs, features, architecture changes)
- **Code Quality**: Review approvals, changes requested, linked issues
- **Timeliness**: How quickly work is completed
- **Collaboration**: Review engagement and issue tracking

## 📊 How Elo Works

- **Starting Rating**: Everyone begins at 1200 Elo
- **Gain/Loss**: Complete challenging tasks to gain points
- **K-Factor**: New contributors have higher rating volatility (32), veterans are more stable (16)
- **Expected vs Actual**: Your rating vs. task difficulty determines point changes

### Task Difficulty Ratings

| Task Type | Base Elo |
|-----------|----------|
| Bug Fix | 1000 |
| Documentation | 1100 |
| Enhancement | 1200 |
| Technical Debt | 1250 |
| Feature | 1300 |
| Refactor | 1300 |
| Hotfix | 1400 |
| Critical Bug | 1500 |
| Architecture | 1500 |

**Adjustments:**
- +50-100 for large code changes (500+ lines)
- +25-50 for many files changed (10+ files)
- +30 for complex reviews (10+ review comments)

## ⚡ Quality Multipliers

Your Elo gain is multiplied based on code quality:

### Positive Factors (Increase multiplier)
- ✅ **Clean Approval**: +15% (no changes requested)
- ✅ **Multiple Approvals**: +10% (2+ reviewers)
- ✅ **Linked Issues**: +5% per issue
- ✅ **Clean Commits**: +5% (≤3 commits)
- ✅ **Good Review Ratio**: +5% (balanced discussion)

### Negative Factors (Decrease multiplier)
- ⚠️ **Changes Requested**: -10% per request
- ⚠️ **Too Many Commits**: -5% (>10 commits, suggests messy work)

**Multiplier Range**: 0.5x to 1.5x

## ⏱️ Time Bonuses

Completion speed affects your rating:

- 🚀 **Under 24 hours**: +10% bonus
- 📅 **Under 3 days**: +5% bonus
- ⏳ **Over 1 week**: -5% penalty
- 🏃 **Under 2 hours**: -10% (might be rushed)

## 🎮 Rank Titles

| Rank | Title | Description |
|------|-------|-------------|
| 1 | 👑 Grand Master | The top contributor |
| 2 | ⭐ Master | Elite performer |
| 3 | 💎 Diamond | Exceptional quality |
| 4 | 🥇 Gold | Consistent excellence |
| 5 | 🥈 Silver | Strong contributor |
| 6 | 🥉 Bronze | Solid work |
| 7+ | 📈 Rising Star | Growing contributor |
| All others | 🌱 Contributor | Part of the team |

## 🔧 Setup Instructions

### 1. Add Files to Your Repository

```bash
# Create directory structure
mkdir -p .github/workflows
mkdir -p .github/scripts

# Copy files
cp elo-leaderboard.yml .github/workflows/
cp elo-calculator.js .github/scripts/
cp leaderboard.json ./
```

### 2. Commit and Push

```bash
git add .github/ leaderboard.json
git commit -m "Add Elo leaderboard system"
git push
```

### 3. Add Labels to Your Repository

The system uses PR labels to determine difficulty. Add these labels:

- `bug` - Bug fixes
- `enhancement` - Improvements
- `feature` - New features
- `refactor` - Code refactoring
- `documentation` - Documentation updates
- `critical` - Critical issues
- `hotfix` - Emergency fixes
- `technical-debt` - Tech debt reduction
- `architecture` - Architectural changes

### 4. Test It

1. Create a test PR with appropriate labels
2. Get it reviewed
3. Merge it
4. Check the PR comments for Elo update
5. View `leaderboard.md` for the full rankings

## 📋 Using the System

### For Contributors

1. **Label Your PRs**: Add appropriate labels to help the system calculate difficulty
2. **Link Issues**: Reference issue numbers (e.g., "Fixes #123") in your PR description
3. **Get Reviews**: Request reviews from teammates
4. **Write Clean Code**: Aim for clean commits and address review feedback
5. **Track Progress**: Check `leaderboard.md` to see your ranking

### For Maintainers

**Ensure Quality PRs Get Rewarded:**
- Review PRs thoroughly
- Approve high-quality work
- Request changes when needed
- Add appropriate labels

**Monitor the System:**
- Check `leaderboard.json` for raw data
- Review `leaderboard.md` for human-readable rankings
- Adjust difficulty ratings in `elo-calculator.js` if needed

## 🎨 Customization

### Adjust Difficulty Ratings

Edit `.github/scripts/elo-calculator.js`:

```javascript
const TASK_DIFFICULTY = {
  'bug': 1000,           // Change these values
  'feature': 1300,       // to match your team's needs
  'critical': 1500,
  // Add custom labels
  'my-custom-label': 1350
};
```

### Modify Quality Multipliers

In `elo-calculator.js`, find `calculateQualityMultiplier()`:

```javascript
// Adjust these values
if (prData.approved_reviews > 0 && prData.changes_requested === 0) {
  multiplier += 0.15;  // Change bonus amount
}
```

### Change K-Factors

In `elo-calculator.js`, find `getKFactor()`:

```javascript
function getKFactor(contributionCount) {
  if (contributionCount < 10) return 32;  // Adjust thresholds
  if (contributionCount < 50) return 24;  // and K values
  return 16;
}
```

## 🔍 Monitoring & Analytics

### View Current Standings

Check `leaderboard.md` - it's automatically updated with:
- Current rankings
- Individual stats
- Recent activity

### Raw Data

`leaderboard.json` contains:
- All contributor ratings
- PR history
- Timestamps
- Metadata

### GitHub Actions Logs

View workflow runs in the "Actions" tab to see:
- Elo calculations
- Point changes
- Any errors

## 🤝 Best Practices

### For Teams

1. **Celebrate Progress**: Share leaderboard updates in team meetings
2. **Encourage Collaboration**: Focus on team wins, not just individual rankings
3. **Balance Competition**: Keep it fun and friendly
4. **Recognize Different Strengths**: Some excel at bugs, others at features
5. **Regular Check-ins**: Review system effectiveness quarterly

### For Individuals

1. **Don't Game the System**: Focus on quality, not just quantity
2. **Help Others**: Review PRs, mentor teammates
3. **Take On Challenges**: Try harder tasks for bigger rewards
4. **Learn from Feedback**: Use reviews to improve
5. **Stay Consistent**: Regular contributions build expertise

## 🐛 Troubleshooting

### Leaderboard Not Updating

1. Check GitHub Actions tab for errors
2. Verify workflow has write permissions
3. Ensure `leaderboard.json` exists in root
4. Check PR was actually merged (not just closed)

### Wrong Elo Calculations

1. Verify PR labels are correct
2. Check if reviews were submitted before merge
3. Review `.github/scripts/elo-calculator.js` for logic errors
4. Check GitHub Actions logs for calculation details

### Missing PR Comment

1. Verify workflow has issue comment permissions
2. Check GitHub Actions logs for API errors
3. Ensure bot user has repository access

## 📈 Future Enhancements

Consider adding:
- Team-based Elo (department rankings)
- Monthly/quarterly resets for fresh starts
- Achievement badges (100 PRs, 1500 Elo, etc.)
- Seasonal competitions
- Integration with Slack/Discord for notifications
- Historical trend graphs
- Review quality scoring (helpful reviews earn points)

## 📝 License

MIT License - Feel free to modify and adapt for your team!

## 🙋 Support

Questions or issues? 
- Check GitHub Actions logs first
- Review this README
- Open an issue in the repository
- Adjust settings in `elo-calculator.js` as needed

---

**Remember**: This system is designed to boost morale and recognize great work. Keep it fun, fair, and focused on team success! 🎉