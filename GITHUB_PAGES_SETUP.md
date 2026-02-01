# GitHub Pages Deployment - Setup Guide

## Problem
The URL https://montbello.github.io/SchuldenKommpass/ was not displaying the current SchuldenKompass frontend application. Instead, it was serving the `docs/` folder which contains documentation.

## Solution
We have created a GitHub Actions workflow that automatically builds and deploys the frontend React application to GitHub Pages.

## What Changed

### 1. GitHub Actions Workflow (`.github/workflows/pages.yml`)
- Automatically builds the frontend when code is pushed to `chore/mvp-and-issues` branch
- Configures Vite build with the correct base path `/SchuldenKommpass/`
- Deploys the built application to GitHub Pages

### 2. Frontend Configuration Updates
- **`vite.config.ts`**: Added support for dynamic base path via `VITE_BASE_PATH` environment variable
- **`App.tsx`**: Updated BrowserRouter to use the base path for proper routing on GitHub Pages
- **`types/index.ts`**: Added missing `INSTITUTION` role to User type
- **`DocumentUpload.tsx`**: Removed unused constant to fix TypeScript compilation

### 3. Build Verification
- Build tested successfully with the GitHub Pages base path
- Asset paths correctly generated with `/SchuldenKommpass/` prefix

## Required Repository Settings

**IMPORTANT**: After this PR is merged, the repository owner needs to configure GitHub Pages:

1. Go to **Repository Settings** → **Pages**
2. Under **"Build and deployment"** section:
   - **Source**: Change from "Deploy from a branch" to **"GitHub Actions"**
3. Save the changes

This enables GitHub Actions to deploy to Pages instead of using the docs folder.

## How It Works

1. When code is pushed to `chore/mvp-and-issues` branch:
   - The workflow triggers automatically
   - Frontend dependencies are installed
   - Frontend is built with `VITE_BASE_PATH=/SchuldenKommpass/`
   - Built files from `frontend/dist/` are uploaded as an artifact
   - Artifact is deployed to GitHub Pages

2. The deployed site will be available at:
   - **https://montbello.github.io/SchuldenKommpass/**

## Manual Trigger

The workflow can also be triggered manually:
1. Go to **Actions** tab in the repository
2. Select **"Deploy Frontend to GitHub Pages"** workflow
3. Click **"Run workflow"** button
4. Select the `chore/mvp-and-issues` branch
5. Click **"Run workflow"**

## Verification Steps

After deployment:
1. Visit https://montbello.github.io/SchuldenKommpass/
2. You should see the SchuldenKompass landing page
3. Navigation and routing should work correctly
4. All assets (CSS, JS, images) should load properly

## Technical Details

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Router**: React Router 7
- **Base Path**: `/SchuldenKommpass/` (configured for GitHub Pages)
- **Node Version**: 20.x
- **Build Output**: `frontend/dist/`

## Troubleshooting

If the deployment doesn't work:

1. **Check workflow status**: Go to Actions tab and check if the workflow ran successfully
2. **Verify Pages settings**: Ensure "GitHub Actions" is selected as the source
3. **Check build logs**: If the build fails, check the workflow logs for errors
4. **Clear browser cache**: Sometimes old content is cached

## Development

For local development, the base path is automatically set to `/`:
```bash
cd frontend
npm install
npm run dev
```

The application will run on http://localhost:5173 without the `/SchuldenKommpass/` prefix.
