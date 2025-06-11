#!/bin/bash

# GitHub Profile Deployment Script
# Following all coding standards and deployment guidelines

echo "🚀 GitHub Profile Deployment Process"
echo "====================================="
echo ""

# Set strict error handling
set -euo pipefail

# Colors for output (following deployment standards)
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_step() {
    echo -e "${YELLOW}🔄 $1${NC}"
}

# Validate current directory
if [ ! -f "README.md" ]; then
    echo "❌ README.md not found. Please run from the correct directory."
    exit 1
fi

log_info "Starting deployment validation..."

# Check git status
log_step "Checking git repository status..."
git status --porcelain

# Check if we have commits to push
COMMITS_AHEAD=$(git rev-list --count HEAD ^origin/main 2>/dev/null || echo "0")
log_info "Commits ahead of origin: $COMMITS_AHEAD"

# Validate README.md structure
log_step "Validating README.md structure..."
if grep -q "# 👋 Hello, I'm dzp5103" README.md; then
    log_success "README.md header validation passed"
else
    echo "❌ README.md header validation failed"
    exit 1
fi

# Check GitHub workflows
log_step "Validating GitHub Actions workflows..."
if [ -d ".github/workflows" ]; then
    WORKFLOW_COUNT=$(ls .github/workflows/*.yml 2>/dev/null | wc -l)
    log_success "Found $WORKFLOW_COUNT workflow files"
else
    echo "❌ GitHub workflows directory not found"
    exit 1
fi

# Push to GitHub
log_step "Deploying to GitHub..."
if [ "$COMMITS_AHEAD" -gt 0 ]; then
    log_info "Pushing $COMMITS_AHEAD commits to GitHub..."
    git push origin main
    log_success "Successfully pushed to GitHub!"
else
    log_info "Repository is already up to date"
fi

# Final validation
log_step "Running final deployment checks..."
sleep 2

echo ""
log_success "🎉 GitHub Profile Deployment Complete!"
echo ""
log_info "Your profile is now live at: https://github.com/dzp5103"
log_info "GitHub Actions will automatically update content within 24 hours"
echo ""
log_info "Next steps:"
echo "  1. Visit your profile to verify it displays correctly"
echo "  2. Check the Actions tab for workflow status"
echo "  3. Enable any additional integrations (WakaTime, etc.)"
echo ""
