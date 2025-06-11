#!/bin/bash

echo "🚀 GitHub Profile Setup Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
print_info "This script will help you deploy your GitHub profile README"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "This is not a Git repository!"
    print_info "Please run this script from your GitHub profile repository"
    exit 1
fi

# Check if repository name matches username
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")
print_info "Repository name: $REPO_NAME"

# Get GitHub username from remote URL
GITHUB_USERNAME=$(git remote get-url origin | sed -n 's/.*github\.com[/:]//p' | sed 's/\/.*$//' | sed 's/\.git$//')

if [ -z "$GITHUB_USERNAME" ]; then
    print_warning "Could not detect GitHub username from remote URL"
    read -p "Please enter your GitHub username: " GITHUB_USERNAME
fi

print_info "GitHub username: $GITHUB_USERNAME"

if [ "$REPO_NAME" != "$GITHUB_USERNAME" ]; then
    print_warning "Repository name ($REPO_NAME) doesn't match username ($GITHUB_USERNAME)"
    print_info "For a GitHub profile README, the repository should have the same name as your username"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if files exist
print_info "Checking required files..."

if [ -f "README.md" ]; then
    print_status "README.md found"
else
    print_error "README.md not found!"
    exit 1
fi

if [ -f ".github/workflows/snake.yml" ]; then
    print_status "Snake workflow found"
else
    print_warning "Snake workflow not found"
fi

if [ -f ".github/workflows/waka-readme.yml" ]; then
    print_status "WakaTime workflow found"
else
    print_warning "WakaTime workflow not found"
fi

# Update README with actual username
print_info "Updating README.md with your username..."
if command -v sed >/dev/null 2>&1; then
    sed -i.bak "s/dzp5103/$GITHUB_USERNAME/g" README.md
    sed -i.bak "s/dzp5103/$GITHUB_USERNAME/g" .github/workflows/snake.yml 2>/dev/null || true
    print_status "Username updated in files"
    rm -f README.md.bak .github/workflows/snake.yml.bak 2>/dev/null || true
else
    print_warning "sed not available. Please manually replace 'dzp5103' with '$GITHUB_USERNAME' in README.md"
fi

# Check git status
print_info "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    print_info "Changes detected. Files to be committed:"
    git status --short
    
    echo ""
    read -p "Commit and push changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Adding files to git..."
        git add .
        
        print_info "Committing changes..."
        git commit -m "🚀 Enhanced GitHub profile with visual elements and automation

✨ Features added:
- Animated typing header
- Comprehensive tech stack showcase
- GitHub statistics and analytics
- Contribution snake animation
- WakaTime integration for coding stats
- Professional styling with Tokyo Night theme
- Interactive elements and social links
- Mobile-responsive design

🔧 Automation:
- GitHub Actions for snake animation
- WakaTime stats auto-update
- Scheduled workflows for fresh content"

        print_info "Pushing to GitHub..."
        git push origin main 2>/dev/null || git push origin master 2>/dev/null || git push
        
        print_status "Successfully deployed to GitHub!"
    else
        print_info "Skipping commit and push"
    fi
else
    print_info "No changes to commit"
fi

echo ""
print_status "Setup complete! 🎉"
echo ""
print_info "Next steps:"
echo "1. Visit https://github.com/$GITHUB_USERNAME to see your profile"
echo "2. Go to repository Settings → Actions → General"
echo "3. Enable 'Allow all actions and reusable workflows'"
echo "4. Check the 'Actions' tab for workflow status"
echo "5. Customize your profile using CUSTOMIZATION_TEMPLATE.md"
echo ""
print_info "Optional integrations:"
echo "• Set up WakaTime: https://wakatime.com/"
echo "• Configure Spotify widget: https://github.com/novatorem/novatorem"
echo "• Review PROFILE_SETUP.md for detailed instructions"
echo ""
print_status "Your GitHub profile is now ready to impress! ⭐"