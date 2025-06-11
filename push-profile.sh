#!/bin/bash

# Simple script to push GitHub profile changes
echo "🚀 Pushing GitHub Profile Changes..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
    echo "✅ Git repository initialized"
fi

# Check if remote origin exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "❌ No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/dzp5103/dzp5103.git"
    echo "   (Replace 'dzp5103' with your actual GitHub username)"
    exit 1
fi

# Stage all changes
echo "📝 Staging all changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "🎨 Update GitHub profile with enhanced README and features

- Added animated typing header with dynamic text
- Comprehensive tech stack with modern badges
- GitHub analytics dashboard with multiple views
- Contribution graphs and streak statistics
- Snake animation for contribution visualization
- Professional social links and contact info
- Learning resources and current focus sections
- Consistent Tokyo Night theme throughout
- Mobile-responsive design
- Enhanced deployment scripts with error handling
- Complete documentation and setup guides
- GitHub Actions workflows for automation"
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo "✅ Profile successfully deployed to GitHub!"
echo "🌐 Your profile should be visible at: https://github.com/dzp5103"
echo ""
echo "📋 Next steps:"
echo "   1. Go to your GitHub profile to verify the changes"
echo "   2. Enable GitHub Actions in your repository settings"
echo "   3. Add WakaTime token if you want coding statistics"
echo "   4. Customize the profile further as needed"
