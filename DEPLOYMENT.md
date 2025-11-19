# GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages when you push to the `main` branch.

## Setup Instructions

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub: https://github.com/jamiesund/ryos
   - Click on **Settings**
   - Scroll down to **Pages** in the left sidebar
   - Under **Source**, select **GitHub Actions**
   - Save the settings

2. **Push your changes:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. **Monitor the deployment:**
   - Go to the **Actions** tab in your GitHub repository
   - You should see a workflow run called "Deploy to GitHub Pages"
   - Wait for it to complete (usually takes 2-5 minutes)

4. **Access your site:**
   - Once deployed, your site will be available at:
   - **https://jamiesund.github.io/ryos/**

## Manual Deployment

If you want to deploy manually, you can trigger the workflow:
- Go to the **Actions** tab
- Select "Deploy to GitHub Pages" workflow
- Click "Run workflow" button

## Local Testing

To test the GitHub Pages build locally:

```bash
bun run build:gh-pages
bun run preview
```

This will build with the correct base path (`/ryos/`) and preview it locally.

## Troubleshooting

- If the site shows a 404, make sure GitHub Pages is enabled and set to use GitHub Actions
- If assets don't load, check that the `BASE_URL` is set correctly in the workflow
- Check the Actions tab for any build errors

