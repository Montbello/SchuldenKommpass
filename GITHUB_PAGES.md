# GitHub Pages Deployment

This application is automatically deployed to GitHub Pages when changes are pushed to the `main` or `copilot/navigate-github-ui` branches.

## Access the Deployed Application

Once deployed, the application will be available at:

**https://montbello.github.io/SchuldenKommpass/**

## How it Works

1. The GitHub Actions workflow in `.github/workflows/pages.yml` is triggered on push to the specified branches
2. The frontend is built with the GitHub Pages base path configuration
3. The build artifact is uploaded to GitHub Pages
4. GitHub Pages serves the application

## Local Development vs GitHub Pages

The application automatically detects the environment:
- **Local development**: Uses base path `/` 
- **GitHub Pages**: Uses base path `/SchuldenKommpass/`

This is handled by the `GITHUB_PAGES` environment variable in the build process.

## Enabling GitHub Pages

To enable GitHub Pages for this repository:

1. Go to repository **Settings** > **Pages**
2. Under "Build and deployment", select:
   - Source: **GitHub Actions**
3. Save the settings

The next push to `main` or `copilot/navigate-github-ui` will trigger a deployment.

## Note on Backend API

⚠️ **Important**: GitHub Pages only serves the frontend (static files). The backend API is not deployed with GitHub Pages.

To fully test the application, you'll need:
1. Frontend on GitHub Pages (for UI testing)
2. Backend deployed separately (e.g., Railway, Heroku, or local development)

For full functionality testing with a live backend, consider using:
- Railway for backend deployment
- Vercel or Netlify for frontend deployment with backend proxy
