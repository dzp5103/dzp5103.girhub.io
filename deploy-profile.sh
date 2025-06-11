#!/bin/bash

# GitHub Profile Setup Script with Enhanced Error Handling
# Version: 2.0
# Author: Enhanced Profile Setup

set -euo pipefail  # Exit on error, undefined vars, pipe failures

echo "🚀 GitHub Profile Setup Script v2.0"
echo "===================================="

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_debug() {
    echo -e "${PURPLE}🔍 DEBUG: $1${NC}"
}

log_step() {
    echo -e "${CYAN}🔄 $1${NC}"
}

# Error handling function
handle_error() {
    local line_no=$1
    local error_code=$2
    log_error "Script failed at line $line_no with exit code $error_code"
    log_error "Please check the output above for details"
    exit $error_code
}

# Set up error trap
trap 'handle_error ${LINENO} $?' ERR

# Validation functions
validate_git_repo() {
    if [ ! -d ".git" ]; then
        log_error "This is not a Git repository!"
        log_info "Please run this script from your GitHub profile repository"
        return 1
    fi
    log_success "Git repository detected"
    return 0
}

validate_file_exists() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        log_success "$description found: $file"
        return 0
    else
        log_error "$description not found: $file"
        return 1
    fi
}

validate_directory_exists() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        log_success "$description found: $dir"
        return 0
    else
        log_warning "$description not found: $dir"
        return 1
    fi
}

validate_network_connectivity() {
    log_step "Checking network connectivity..."
    
    if command -v curl >/dev/null 2>&1; then
        if curl -s --connect-timeout 5 https://github.com >/dev/null; then
            log_success "Network connectivity verified"
            return 0
        else
            log_error "Cannot connect to GitHub. Please check your internet connection"
            return 1
        fi
    else
        log_warning "curl not available, skipping network check"
        return 0
    fi
}

check_dependencies() {
    log_step "Checking system dependencies..."
    
    local dependencies=("git" "sed")
    local missing_deps=()
    
    for dep in "${dependencies[@]}"; do
        if command -v "$dep" >/dev/null 2>&1; then
            log_success "$dep is installed"
        else
            log_error "$dep is not installed"
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install the missing dependencies and try again"
        return 1
    fi
    
    return 0
}

get_github_username() {
    local username=""
    
    # Try to get username from remote URL
    if git remote get-url origin >/dev/null 2>&1; then
        username=$(git remote get-url origin | sed -n 's/.*github\.com[/:]\([^/]*\)\/.*$/\1/p' | sed 's/\.git$//')
        
        if [ -n "$username" ]; then
            log_success "GitHub username detected from remote: $username"
            echo "$username"
            return 0
        fi
    fi
    
    # Try to get from git config
    if git config user.name >/dev/null 2>&1; then
        username=$(git config user.name)
        log_info "Using git config username: $username"
        echo "$username"
        return 0
    fi
    
    # Prompt user for username
    log_warning "Could not auto-detect GitHub username"
    while [ -z "$username" ]; do
        read -p "Please enter your GitHub username: " username
        if [ -z "$username" ]; then
            log_error "Username cannot be empty"
        fi
    done
    
    echo "$username"
    return 0
}

validate_username_format() {
    local username=$1
    
    # GitHub username validation pattern - more permissive
    if [[ $username =~ ^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$ ]] || [[ $username =~ ^[a-zA-Z0-9]$ ]]; then
        # Additional check for length (1-39 characters)
        if [ ${#username} -le 39 ] && [ ${#username} -ge 1 ]; then
            log_success "Username format is valid"
            return 0
        fi
    fi
    
    log_error "Invalid GitHub username format: $username"
    log_info "GitHub usernames must:"
    log_info "- Be 1-39 characters long"
    log_info "- Start and end with alphanumeric characters"
    log_info "- Only contain alphanumeric characters and hyphens"
    log_info "- Not have consecutive hyphens"
    return 1
}

check_repository_name() {
    local username=$1
    local repo_name=$(basename "$(git rev-parse --show-toplevel)")
    
    log_info "Repository name: $repo_name"
    log_info "GitHub username: $username"
    
    if [ "$repo_name" != "$username" ]; then
        log_warning "Repository name ($repo_name) doesn't match username ($username)"
        log_info "For a GitHub profile README, the repository should have the same name as your username"
        
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    else
        log_success "Repository name matches username"
    fi
}

backup_files() {
    log_step "Creating backup of existing files..."
    
    local backup_dir=".backup_$(date +%Y%m%d_%H%M%S)"
    
    if [ -f "README.md" ]; then
        mkdir -p "$backup_dir"
        cp "README.md" "$backup_dir/README.md.bak"
        log_success "README.md backed up to $backup_dir/"
    fi
    
    if [ -d ".github/workflows" ]; then
        mkdir -p "$backup_dir/.github"
        cp -r ".github/workflows" "$backup_dir/.github/"
        log_success "Workflows backed up to $backup_dir/.github/"
    fi
}

validate_readme_content() {
    log_step "Validating README.md content..."
    
    if [ ! -f "README.md" ]; then
        log_error "README.md not found!"
        return 1
    fi
    
    # Check for required sections
    local required_sections=("# " "## " "### ")
    local found_sections=0
    
    for section in "${required_sections[@]}"; do
        if grep -q "^$section" "README.md"; then
            ((found_sections++))
        fi
    done
    
    if [ $found_sections -gt 0 ]; then
        log_success "README.md has proper markdown structure"
    else
        log_warning "README.md may not have proper markdown structure"
    fi
    
    # Check file size
    local file_size=$(stat -c%s "README.md" 2>/dev/null || stat -f%z "README.md" 2>/dev/null || echo "0")
    if [ "$file_size" -gt 1000 ]; then
        log_success "README.md has substantial content ($file_size bytes)"
    else
        log_warning "README.md seems quite small ($file_size bytes)"
    fi
    
    return 0
}

update_username_in_files() {
    local username=$1
    log_step "Updating files with username: $username..."
    
    # Create a list of files to update
    local files_to_update=()
    
    if [ -f "README.md" ]; then
        files_to_update+=("README.md")
    fi
    
    if [ -f ".github/workflows/snake.yml" ]; then
        files_to_update+=(".github/workflows/snake.yml")
    fi
    
    if [ -f ".github/workflows/waka-readme.yml" ]; then
        files_to_update+=(".github/workflows/waka-readme.yml")
    fi
    
    # Update each file
    for file in "${files_to_update[@]}"; do
        if [ -f "$file" ]; then
            log_debug "Updating $file..."
            
            # Create temporary file for safe replacement
            local temp_file=$(mktemp)
            
            # Replace dzp5103 with actual username, but preserve case sensitivity
            sed "s/dzp5103/$username/g" "$file" > "$temp_file"
            
            # Only replace if the operation was successful
            if [ $? -eq 0 ]; then
                mv "$temp_file" "$file"
                log_success "Updated $file"
            else
                rm -f "$temp_file"
                log_error "Failed to update $file"
                return 1
            fi
        fi
    done
    
    return 0
}

check_github_actions() {
    log_step "Checking GitHub Actions workflows..."
    
    local workflows_dir=".github/workflows"
    
    if validate_directory_exists "$workflows_dir" "GitHub workflows directory"; then
        local workflow_count=$(find "$workflows_dir" -name "*.yml" -o -name "*.yaml" | wc -l)
        log_success "Found $workflow_count workflow file(s)"
        
        # List workflow files
        find "$workflows_dir" -name "*.yml" -o -name "*.yaml" | while read -r workflow; do
            log_info "Workflow: $(basename "$workflow")"
        done
    else
        log_warning "No GitHub workflows directory found"
        log_info "Workflows will be created automatically when you push to GitHub"
    fi
}

commit_and_push() {
    log_step "Checking git status..."
    
    # Check if there are any changes
    if git diff --quiet && git diff --staged --quiet; then
        log_info "No changes detected"
        return 0
    fi
    
    # Show changes
    log_info "Changes detected:"
    git status --short
    
    echo
    read -p "Do you want to commit and push these changes? (Y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        log_info "Skipping commit and push"
        return 0
    fi
    
    log_step "Staging files..."
    git add .
    
    log_step "Committing changes..."
    local commit_message="🚀 Enhanced GitHub profile with comprehensive features

✨ Features added:
- Animated typing header with multiple tech roles
- Comprehensive tech stack showcase with modern badges
- GitHub statistics and analytics dashboard
- Contribution snake animation
- WakaTime integration for coding time tracking
- Professional styling with Tokyo Night theme
- Interactive elements and social media links
- Mobile-responsive design
- Learning resources and trending repositories
- Random dev quotes and Spotify integration
- Open source contribution tracking

🔧 Automation:
- GitHub Actions for snake animation generation
- WakaTime stats auto-update workflow
- Scheduled workflows for fresh content
- Profile auto-update system

🎨 Enhanced Design:
- Consistent color scheme throughout
- Professional typography and spacing
- Interactive badges and shields
- Mermaid diagrams for project visualization
- Expandable sections for detailed stats

📱 Interactive Features:
- Live GitHub trending repositories
- Real-time coding statistics
- Dynamic content updates
- Social media integration
- Portfolio and contact links

Ready to make a professional impression! 🌟"

    if git commit -m "$commit_message"; then
        log_success "Changes committed successfully"
    else
        log_error "Failed to commit changes"
        return 1
    fi
    
    log_step "Pushing to GitHub..."
    
    # Try different branch names
    local branches=("main" "master")
    local pushed=false
    
    for branch in "${branches[@]}"; do
        if git show-ref --verify --quiet "refs/heads/$branch"; then
            log_debug "Attempting to push to $branch branch..."
            if git push origin "$branch" 2>/dev/null; then
                log_success "Successfully pushed to $branch branch"
                pushed=true
                break
            fi
        fi
    done
    
    if [ "$pushed" = false ]; then
        log_debug "Attempting to push to current branch..."
        if git push; then
            log_success "Successfully pushed to current branch"
            pushed=true
        fi
    fi
    
    if [ "$pushed" = false ]; then
        log_error "Failed to push changes"
        log_info "You may need to set up the remote repository or check your permissions"
        return 1
    fi
    
    return 0
}

setup_github_actions() {
    local username=$1
    log_step "Setting up GitHub Actions workflows..."
    
    # Create workflows directory if it doesn't exist
    mkdir -p ".github/workflows"
    
    # Create or update snake workflow
    cat > ".github/workflows/snake.yml" << EOF
name: Generate Snake

on:
  # Run automatically every 24 hours
  schedule:
    - cron: "0 0 * * *"
  
  # Allows manual run
  workflow_dispatch:
  
  # Run on every push to main/master
  push:
    branches:
      - main
      - master
    
jobs:
  generate:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        
      - name: Generate github-contribution-grid-snake.svg
        uses: Platane/snk/svg-only@v3
        with:
          github_user_name: $username
          outputs: |
            dist/github-contribution-grid-snake.svg
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          
      - name: Push github-contribution-grid-snake.svg to output branch
        uses: crazy-max/ghaction-github-pages@v4.0.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
EOF
    
    log_success "Snake workflow created/updated"
    
    # Create or update profile auto-update workflow
    cat > ".github/workflows/profile-update.yml" << EOF
name: Profile Auto-Update

on:
  schedule:
    # Run every 6 hours to keep profile fresh
    - cron: '0 */6 * * *'
  workflow_dispatch:
  push:
    branches: [ main, master ]

jobs:
  update-profile:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Update README timestamps
      run: |
        echo "Last updated: \$(date)" >> README.md
        
    - name: Commit changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add .
        git diff --staged --quiet || git commit -m "🤖 Auto-update profile \$(date '+%Y-%m-%d %H:%M:%S')"
        git push
EOF
    
    log_success "Profile auto-update workflow created/updated"
}

display_next_steps() {
    local username=$1
    
    echo
    log_success "🎉 Setup completed successfully!"
    echo
    log_info "Next Steps:"
    echo "1. 🌐 Visit https://github.com/$username to see your enhanced profile"
    echo "2. ⚙️  Go to repository Settings → Actions → General"
    echo "3. ✅ Enable 'Allow all actions and reusable workflows'"
    echo "4. 📊 Check the 'Actions' tab for workflow status"
    echo "5. 🎨 Customize further using CUSTOMIZATION_TEMPLATE.md"
    echo "6. 📱 Test your profile on different devices"
    echo
    log_info "Optional Integrations:"
    echo "• 📈 Set up WakaTime: https://wakatime.com/"
    echo "• 🎵 Configure Spotify widget: https://github.com/novatorem/novatorem"
    echo "• 📚 Review PROFILE_SETUP.md for detailed instructions"
    echo "• 🔧 Explore FEATURE_SHOWCASE.md for all available features"
    echo
    log_info "Troubleshooting:"
    echo "• If snake animation doesn't appear, check GitHub Actions status"
    echo "• Ensure your repository is public for widgets to work"
    echo "• Some stats may take 24-48 hours to populate"
    echo
    log_success "Your GitHub profile is now ready to impress! ⭐"
    echo
    log_info "🔄 The profile will auto-update every 6 hours with fresh content"
    log_info "🐍 Snake animation will regenerate daily"
    log_info "📊 Stats widgets will refresh automatically"
}

run_comprehensive_validation() {
    log_step "Running comprehensive validation..."
    
    local validation_errors=0
    
    # Core validations
    validate_git_repo || ((validation_errors++))
    check_dependencies || ((validation_errors++))
    validate_network_connectivity || ((validation_errors++))
    
    # File validations
    validate_file_exists "README.md" "README file" || ((validation_errors++))
    validate_readme_content || ((validation_errors++))
    
    # Directory validations
    validate_directory_exists ".github" "GitHub configuration directory" || log_warning "Will create .github directory"
    
    if [ $validation_errors -gt 0 ]; then
        log_error "Validation failed with $validation_errors error(s)"
        log_info "Please fix the errors above and try again"
        return 1
    fi
    
    log_success "All validations passed!"
    return 0
}

# Main execution
main() {
    echo
    log_info "Starting GitHub Profile Enhancement Process..."
    echo
    
    # Run comprehensive validation
    if ! run_comprehensive_validation; then
        exit 1
    fi
    
    # Get and validate username
    local username
    username=$(get_github_username)
    
    if ! validate_username_format "$username"; then
        exit 1
    fi
    
    # Check repository setup
    check_repository_name "$username"
    
    # Create backups
    backup_files
    
    # Update files with username
    if ! update_username_in_files "$username"; then
        log_error "Failed to update files with username"
        exit 1
    fi
    
    # Setup GitHub Actions
    setup_github_actions "$username"
    
    # Check workflows
    check_github_actions
    
    # Commit and push changes
    if ! commit_and_push; then
        log_warning "Changes were not pushed to GitHub"
        log_info "You can manually commit and push later using:"
        log_info "git add . && git commit -m 'Enhanced GitHub profile' && git push"
    fi
    
    # Display next steps
    display_next_steps "$username"
}

# Run main function
main "$@"