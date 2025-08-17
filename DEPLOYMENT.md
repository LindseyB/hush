# GitHub Pages Deployment Guide

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

## 🚀 Live Demo

Once deployed, the app will be available at: **https://LindseyB.github.io/hush**

## Automatic Deployment

The app automatically deploys to GitHub Pages when:
- Code is pushed to the `main` branch
- A pull request is merged into `main`

The deployment is handled by the GitHub Actions workflow in `.github/workflows/deploy.yml`.

## Manual Deployment

You can also deploy manually using:

```bash
npm run deploy
```

This will build the app and push it to the `gh-pages` branch.

## Setup Requirements

### 1. GitHub Repository Settings

1. Go to your GitHub repository settings
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### 2. Branch Protection (Optional but Recommended)

Consider protecting your `main` branch:
1. Go to **Settings** → **Branches**
2. Add a branch protection rule for `main`
3. Enable "Require status checks to pass before merging"

## Workflow Details

The deployment workflow:
1. **Triggers**: On push to `main` or pull requests to `main`
2. **Build**: Installs dependencies and builds the React app
3. **Deploy**: Uploads the build artifacts to GitHub Pages

## Troubleshooting

### Common Issues:

1. **Blank page after deployment**:
   - Check that the `homepage` field in `package.json` matches your GitHub Pages URL
   - Verify all asset paths are relative to the root

2. **Audio files not loading**:
   - Ensure audio files are in the `public/audio/` directory
   - Use absolute paths starting with `/` for public assets

3. **Build fails**:
   - Check the Actions tab in your GitHub repository for detailed error logs
   - Ensure all dependencies are properly listed in `package.json`

### Viewing Deployment Status

1. Go to the **Actions** tab in your GitHub repository
2. Click on the latest workflow run to see deployment details
3. Check the **Deployments** section in your repository for live status

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## File Structure

```
.github/
  workflows/
    deploy.yml          # GitHub Actions deployment workflow
public/
  audio/                # Audio files (accessible via /audio/ in deployed app)
src/                    # React source code
package.json            # Includes homepage and deploy scripts
```
