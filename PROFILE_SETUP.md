# 🚀 GitHub Profile Setup Guide

This guide will help you customize and activate all the features in your GitHub profile README.

## 📋 Quick Customization Checklist

### 1. Personal Information
Replace the following placeholders in [`README.md`](README.md):

- `[Your Name]` → Your actual name
- `Your Location 🌍` → Your city/country
- Update the `developer` object with your real information
- Add your actual skills and technologies

### 2. Social Media Links
Update these sections with your actual profiles:

```markdown
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourprofile)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/yourhandle)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://yourportfolio.com)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:your.email@gmail.com)
```

### 3. Featured Projects
Replace `project1`, `project2`, etc. with your actual repository names:

```markdown
[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=dzp5103&repo=your-actual-repo&theme=tokyonight)](https://github.com/dzp5103/your-actual-repo)
```

## 🔧 Advanced Features Setup

### 1. Contribution Snake Animation
The snake animation workflow is already set up in [`.github/workflows/snake.yml`](.github/workflows/snake.yml).

**To activate:**
1. Go to your repository Settings
2. Navigate to Actions → General
3. Ensure "Allow all actions and reusable workflows" is selected
4. The workflow will run automatically and create the snake animation

### 2. WakaTime Integration (Coding Time Tracking)
1. Sign up at [WakaTime](https://wakatime.com/)
2. Install WakaTime plugin in your IDE
3. Get your WakaTime API key from your dashboard
4. Add the following to your repository secrets:
   - `WAKATIME_API_KEY` → Your WakaTime API key
5. Add this workflow to `.github/workflows/waka-readme.yml`:

```yaml
name: Waka Readme

on:
  schedule:
    - cron: '30 18 * * *'
  workflow_dispatch:
    
jobs:
  update-readme:
    name: Update Readme with Metrics
    runs-on: ubuntu-latest
    steps:
      - uses: anmol098/waka-readme-stats@master
        with:
          WAKATIME_API_KEY: ${{ secrets.WAKATIME_API_KEY }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. Spotify Integration
1. Create a Spotify app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Get your Client ID and Client Secret
3. Deploy the [Novatorem](https://github.com/novatorem/novatorem) Vercel app
4. Connect your Spotify account
5. The widget will automatically show your currently playing track

### 4. GitHub Stats Customization
You can customize the stats appearance by modifying the theme and parameters:

```markdown
<!-- Available themes: default, transparent, dark, radical, merko, gruvbox, tokyonight, onedark, cobalt, synthwave, highcontrast, dracula -->
![Stats](https://github-readme-stats.vercel.app/api?username=dzp5103&theme=tokyonight&show_icons=true&count_private=true)
```

## 🎨 Theme Customization

### Available Themes:
- `default` - Clean white theme
- `dark` - Dark mode
- `radical` - Bright purple/pink
- `merko` - Green terminal style
- `gruvbox` - Warm retro colors
- `tokyonight` - Blue/purple night theme (current)
- `onedark` - VS Code One Dark
- `cobalt` - Blue cobalt theme
- `synthwave` - Retro 80s style
- `dracula` - Popular dark theme

### Color Scheme:
The current setup uses a consistent **Tokyo Night** theme across all components for a cohesive look.

## 📊 Stats Configuration

### GitHub Stats Options:
```markdown
<!-- Show private contributions -->
&count_private=true

<!-- Hide specific stats -->
&hide=stars,commits,prs,issues

<!-- Show additional stats -->
&show_icons=true&include_all_commits=true

<!-- Custom title -->
&custom_title=My GitHub Stats
```

### Language Stats Options:
```markdown
<!-- Exclude specific languages -->
&exclude_repo=repo1,repo2

<!-- Hide specific languages -->
&hide=html,css

<!-- Compact layout -->
&layout=compact

<!-- Show more languages -->
&langs_count=10
```

## 🚀 Repository Setup Instructions

### 1. Create the Special Repository
1. Create a new repository with the **same name as your username**
2. Make it **public**
3. Initialize with a README (or replace the existing one)

### 2. Upload Your Files
1. Replace the README.md with the enhanced version
2. Add the `.github/workflows/snake.yml` file
3. Commit and push the changes

### 3. Enable GitHub Actions
1. Go to the repository Settings
2. Navigate to Actions → General
3. Select "Allow all actions and reusable workflows"
4. Save changes

### 4. Wait for Actions to Run
- The snake animation will generate within 24 hours or on the next push
- Check the Actions tab to monitor progress

## 🔍 Troubleshooting

### Snake Animation Not Working?
- Ensure the repository is public
- Check that GitHub Actions are enabled
- Verify the workflow file syntax
- Look for errors in the Actions tab

### Stats Not Loading?
- GitHub Stats API might be rate-limited
- Try refreshing after a few minutes
- Check if the username is correct in all URLs

### Missing Profile Views?
- The profile view counter needs time to initialize
- Views only count after the first visitor

## 📝 Content Suggestions

### Bio Section Ideas:
- Current learning goals
- Technologies you're passionate about
- Open source contributions
- Career highlights
- Personal projects
- Hobbies related to tech

### Fun Facts:
- First programming language learned
- Favorite development tools
- Interesting project challenges
- Tech community involvement
- Side projects or experiments

## 🎯 Pro Tips

1. **Keep it Updated**: Regularly update your skills and featured projects
2. **Personal Touch**: Add your personality with fun facts and emojis
3. **Professional Balance**: Mix technical skills with personal interests
4. **Mobile-Friendly**: The current design works well on all devices
5. **Performance**: All images and widgets are optimized for fast loading

## 📚 Additional Resources

- [GitHub Profile README Generator](https://rahuldkjain.github.io/gh-profile-readme-generator/)
- [Shields.io](https://shields.io/) - Custom badges
- [GitHub Stats API](https://github.com/anuraghazra/github-readme-stats)
- [Awesome GitHub Profile README](https://github.com/abhisheknaiidu/awesome-github-profile-readme)

---

## ✅ Final Checklist

Before going live, ensure you've:

- [ ] Updated all personal information
- [ ] Added real social media links
- [ ] Replaced placeholder project names
- [ ] Enabled GitHub Actions
- [ ] Tested all external links
- [ ] Customized the tech stack to match your skills
- [ ] Added your actual achievements and stats
- [ ] Verified the repository is public
- [ ] Set up additional integrations (WakaTime, Spotify)

Your GitHub profile is now ready to make a strong impression! 🌟