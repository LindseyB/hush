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

## Workflow Details

The deployment workflow:
1. **Triggers**: On push to `main` or pull requests to `main`
2. **Build**: Installs dependencies and builds the React app
3. **Deploy**: Uploads the build artifacts to GitHub Pages

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

