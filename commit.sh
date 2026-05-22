#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}📝 Fresh Talent Store - Git Commit Helper${NC}"
echo ""

# Show current status
echo -e "${YELLOW}Current changes:${NC}"
git status --short
echo ""

# Ask for commit message
read -p "Enter commit message: " message

if [ -z "$message" ]; then
    echo "❌ Commit message cannot be empty!"
    exit 1
fi

# Add all changes
git add .

# Commit
git commit -m "$message"

# Push to GitHub
echo -e "${GREEN}🚀 Pushing to GitHub...${NC}"
git push origin main

echo ""
echo -e "${GREEN}✅ Done! Check your contributions at:${NC}"
echo "https://github.com/Samuel-AKINGENEYE/Fresh-talent-store"
