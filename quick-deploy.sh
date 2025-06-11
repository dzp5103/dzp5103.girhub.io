#!/bin/bash

# GitHub Profile Deployment Script
echo "🚀 Deploying GitHub Profile..."

# Set working directory
cd /workspaces/dzp5103

# Configure git (if needed)
git config --global user.email "action@github.com"
git config --global user.name "GitHub Actions"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add remote if not exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "🔗 Adding remote repository..."
    git remote add origin https://github.com/dzp5103/dzp5103.git
fi

# Stage all files
echo "📝 Staging files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    # Commit changes
    echo "💾 Committing changes..."
    git commit -m "🎨 Deploy enhanced GitHub profile

Features: Animations, stats, workflows, documentation
Technical: Error handling, automation, clean code
Files: 18 created/modified with comprehensive features"
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo "✅ Profile deployed successfully!"
echo "🌐 Visit: https://github.com/dzp5103"
