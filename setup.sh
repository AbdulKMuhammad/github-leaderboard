#!/bin/bash

# setup.sh - Setup script for GitHub Elo Leaderboard

set -e

echo "🏆 GitHub Elo Leaderboard Setup"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    echo "Please run this script from the root of your git repository"
    exit 1
fi

echo -e "${BLUE}Step 1: Creating directory structure${NC}"
mkdir -p .github/workflows
mkdir -p .github/scripts
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

echo -e "${BLUE}Step 2: Copying workflow files${NC}"
if [ -f "elo-leaderboard.yml" ]; then
    cp elo-leaderboard.yml .github/workflows/
    echo -e "${GREEN}✓ Workflow file copied${NC}"
else
    echo -e "${YELLOW}⚠ elo-leaderboard.yml not found in current directory${NC}"
    echo "Please ensure you have the workflow file"
fi
echo ""

echo -e "${BLUE}Step 3: Copying calculator script${NC}"
if [ -f "elo-calculator.js" ]; then
    cp elo-calculator.js .github/scripts/
    echo -e "${GREEN}✓ Calculator script copied${NC}"
else
    echo -e "${YELLOW}⚠ elo-calculator.js not found in current directory${NC}"
    echo "Please ensure you have the calculator script"
fi
echo ""

echo -e "${BLUE}Step 4: Copying configuration${NC}"
if [ -f "config.js" ]; then
    cp config.js .github/scripts/
    echo -e "${GREEN}✓ Configuration copied${NC}"
else
    echo -e "${YELLOW}⚠ config.js not found (optional)${NC}"
fi
echo ""

echo -e "${BLUE}Step 5: Initializing leaderboard${NC}"
if [ ! -f "leaderboard.json" ]; then
    cat > leaderboard.json << 'EOF'
{
  "contributors": {},
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "totalPRs": 0,
  "metadata": {
    "startingElo": 1200,
    "version": "1.0.0",
    "description": "Elo-based contribution leaderboard"
  }
}
EOF
    echo -e "${GREEN}✓ leaderboard.json created${NC}"
else
    echo -e "${YELLOW}⚠ leaderboard.json already exists, skipping${NC}"
fi
echo ""

echo -e "${BLUE}Step 6: Creating initial markdown leaderboard${NC}"
if [ ! -f "leaderboard.md" ]; then
    cat > leaderboard.md << 'EOF'
# 🏆 Contribution Leaderboard

*Waiting for first PR to be merged...*

The leaderboard will be automatically updated when pull requests are merged.
EOF
    echo -e "${GREEN}✓ leaderboard.md created${NC}"
else
    echo -e "${YELLOW}⚠ leaderboard.md already exists, skipping${NC}"
fi
echo ""

echo -e "${BLUE}Step 7: Checking GitHub labels${NC}"
echo "The following labels are recommended for the Elo system:"
echo "  - bug"
echo "  - enhancement"
echo "  - feature"
echo "  - refactor"
echo "  - documentation"
echo "  - critical"
echo "  - hotfix"
echo "  - technical-debt"
echo "  - architecture"
echo ""
echo -e "${YELLOW}You'll need to add these labels manually in your GitHub repository settings${NC}"
echo -e "${YELLOW}Settings > Labels > New label${NC}"
echo ""

echo -e "${BLUE}Step 8: Committing changes${NC}"
read -p "Do you want to commit these changes? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .github/ leaderboard.json leaderboard.md
    git commit -m "Add Elo leaderboard system

- Automated PR scoring based on difficulty and quality
- GitHub Actions workflow for automatic updates
- Markdown leaderboard for easy viewing"
    echo -e "${GREEN}✓ Changes committed${NC}"
    echo ""
    echo -e "${YELLOW}Don't forget to push: git push${NC}"
else
    echo -e "${YELLOW}Skipping commit. You can commit manually later.${NC}"
fi
echo ""

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo "Next steps:"
echo "1. Push your changes: git push"
echo "2. Add recommended labels in GitHub settings"
echo "3. Create a test PR to verify the system works"
echo "4. Check the Actions tab for workflow execution"
echo "5. View leaderboard.md after your first merged PR"
echo ""
echo "For more information, see README.md"
echo ""