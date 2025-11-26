# Quick Start Guide

## Installation (5 minutes)

### Option 1: Automated Setup
```bash
# Run the setup script
./setup.sh

# Push changes
git push
```

### Option 2: Manual Setup
```bash
# Create directories
mkdir -p .github/workflows .github/scripts

# Copy files
cp elo-leaderboard.yml .github/workflows/
cp elo-calculator.js .github/scripts/
cp leaderboard.json ./
cp leaderboard.md ./

# Commit and push
git add .github/ leaderboard.json leaderboard.md
git commit -m "Add Elo leaderboard system"
git push
```

## Example: Your First PR

### 1. Create a PR with labels
```markdown
Title: Fix login button alignment
Labels: bug

Description:
Fixed the login button that was misaligned on mobile devices.
Fixes #42
```

### 2. Get it reviewed
- Request review from a teammate
- Address any feedback
- Get approval

### 3. Merge the PR
When you merge, the system automatically:
- Calculates task difficulty (bug = 1000 base rating)
- Applies quality multipliers (clean approval = +15%)
- Adds time bonus (merged in <24h = +10%)
- Updates your Elo rating
- Posts a comment with results

### 4. Check your score
The PR will get a comment like:
```
## 🎮 Elo Update

john-doe earned +14 Elo points!

- Current Rating: 1214 (Rank #3)
- Task Difficulty: 1000
- Quality Multiplier: 1.20x
- Time Bonus: 1.10x

[View Full Leaderboard](link)
```

## Example Calculations

### Example 1: Simple Bug Fix
**PR Details:**
- Type: Bug fix
- Changes: 50 lines added, 20 deleted
- Files: 2
- Reviews: 1 approval, 0 changes requested
- Time: 6 hours
- Issues linked: 1

**Calculation:**
```
Base difficulty: 1000 (bug label)
Quality multiplier: 1.25x (clean approval + linked issue)
Time bonus: 1.10x (under 24 hours)

Expected score: ~0.42 (you're 1200 vs task 1000)
K-factor: 24 (regular contributor)

Elo change = 24 × (1 - 0.42) × 1.25 × 1.10 = +19 points
New rating: 1219
```

### Example 2: Complex Feature
**PR Details:**
- Type: Feature + Architecture
- Changes: 1500 lines added, 400 deleted
- Files: 25
- Reviews: 2 approvals, 1 change request
- Time: 5 days
- Issues linked: 3

**Calculation:**
```
Base difficulty: 1500 (architecture label)
+ 100 (large change >1000 lines)
+ 50 (many files >20)
= 1650

Quality multiplier: 1.10x (2 approvals, 3 issues, 1 change)
Time bonus: 0.95x (5 days, slight penalty)

Expected score: ~0.30 (you're 1200 vs task 1650)
K-factor: 24

Elo change = 24 × (1 - 0.30) × 1.10 × 0.95 = +17 points
New rating: 1217
```

### Example 3: Rushed Low-Quality PR
**PR Details:**
- Type: Feature
- Changes: 200 lines
- Files: 8
- Reviews: 0 approvals, 2 changes requested
- Time: 1 hour (very fast)
- Issues linked: 0

**Calculation:**
```
Base difficulty: 1300 (feature label)

Quality multiplier: 0.70x (2 changes requested, no approvals)
Time bonus: 0.90x (rushed, <2 hours)

Expected score: ~0.35 (you're 1200 vs task 1300)
K-factor: 24

Elo change = 24 × (1 - 0.35) × 0.70 × 0.90 = +10 points
New rating: 1210
```

## Understanding Your Score

### Rating Ranges
- **1000-1150**: Getting started
- **1150-1250**: Solid contributor
- **1250-1400**: Strong performer
- **1400-1550**: Expert
- **1550+**: Elite

### What Affects Your Score?

**Increase your rating:**
✅ Take on challenging tasks (features, architecture)
✅ Get clean approvals without changes requested
✅ Link PRs to issues
✅ Keep commits clean and focused
✅ Complete work in reasonable timeframes
✅ Write good documentation

**Decrease gains (or lose points):**
❌ Cherry-picking only easy bugs
❌ Multiple changes requested
❌ Messy commit history (10+ commits)
❌ No linked issues
❌ Either rushed (<2h) or stale (>1 week)

## Tips for Success

### 1. Label Everything
Always add appropriate labels to your PRs:
```
bug - For bug fixes
feature - For new features
enhancement - For improvements
documentation - For docs
critical - For urgent issues
```

### 2. Write Good Descriptions
```markdown
## Problem
Brief description of what was broken

## Solution
How you fixed it

## Testing
How you verified the fix

Fixes #123
```

### 3. Keep Commits Clean
```bash
# Good: Small, focused commits
git commit -m "Fix button alignment"
git commit -m "Add test for button layout"

# Avoid: Too many commits
# Use interactive rebase to squash if needed
git rebase -i HEAD~5
```

### 4. Request Reviews Early
Don't wait until the PR is "perfect":
```
1. Create PR as draft
2. Request early feedback
3. Address comments
4. Mark as ready for review
5. Get final approval
```

### 5. Link Issues
Always reference related issues:
```
Fixes #42
Closes #43
Related to #44
```

## Common Scenarios

### "I only do bug fixes, will I rank lower?"
No! The system considers:
- Bug fixes have appropriate difficulty (1000)
- You'll gain steady points
- Quality matters more than difficulty
- You might gain more per PR than someone doing messy complex work

### "What if I'm new to the codebase?"
- New contributors have higher K-factor (32 vs 16)
- Your rating changes faster as you learn
- You won't be penalized for learning
- Document your learning in PRs for bonus points

### "How do I climb the leaderboard fast?"
Don't try to game the system. Instead:
1. Focus on quality over quantity
2. Take on appropriately challenging work
3. Help others through reviews
4. Be consistent
5. Learn and improve

### "Can I lose points?"
Technically no - completing PRs always gives positive points.
But you might gain fewer points if:
- Quality is low (many changes requested)
- Work is rushed or dragging
- Tasks are too easy relative to your skill

## Monitoring Your Progress

### Check Your Stats
```bash
# View the leaderboard
cat leaderboard.md

# Check raw data
cat leaderboard.json | grep "your-username" -A 10
```

### Track Your Improvement
The system stores your last 10 PRs:
- Average difficulty you tackle
- Your quality trend
- Recent Elo changes

### Set Goals
- "Reach 1300 Elo this month"
- "Complete 5 feature PRs this quarter"
- "Maintain 1.2x+ quality multiplier"

## Troubleshooting

### Workflow didn't run
1. Check Actions tab for errors
2. Verify PR was merged (not just closed)
3. Check workflow permissions in repo settings

### Score seems wrong
1. Check PR labels - they determine difficulty
2. Verify review data (approvals/changes)
3. Look at GitHub Actions log for calculation details

### Want to adjust scoring
1. Edit `.github/scripts/config.js`
2. Modify difficulty ratings or multipliers
3. Commit and push changes
4. System uses new values for future PRs

## Next Steps

1. **Create your first test PR** - See how it works
2. **Review the leaderboard** - Check rankings
3. **Customize settings** - Adjust to your team's needs
4. **Share with team** - Get everyone involved
5. **Track progress** - Monitor over time

---

Questions? Check the main README.md or open an issue!