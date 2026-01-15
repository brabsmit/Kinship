# Deployment Guide - Kinship Chronicles

This guide explains how to deploy Kinship Chronicles to GitHub Pages so family members can access it without relying on your local computer.

## Overview

The app is configured to automatically deploy to GitHub Pages whenever you push changes to the `main` branch. The deployment URL will be:

```
https://brabsmit.github.io/Kinship/
```

## One-Time Setup

### 1. Enable GitHub Pages

1. Go to your repository settings: https://github.com/brabsmit/Kinship/settings/pages
2. Under "Build and deployment":
   - Source: Select **"GitHub Actions"**
   - This allows the automated workflow to deploy the site

### 2. Add GitHub Secrets

The app uses environment variables for API keys and passwords. You need to add these as GitHub Secrets:

1. Go to: https://github.com/brabsmit/Kinship/settings/secrets/actions
2. Click **"New repository secret"** and add:

   **Secret 1:**
   - Name: `VITE_GEMINI_API_KEY`
   - Value: Your Google Gemini API key
   - Get one at: https://aistudio.google.com/app/apikey

   **Secret 2:**
   - Name: `VITE_USER_PASSWORD`
   - Value: Whatever password you want for AI features (e.g., `family2024`)

### 3. Restrict Your Google API Key (Important!)

Since the API key will be baked into the frontend code, restrict it to prevent unauthorized use:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your Gemini API key
3. Click "Edit API key"
4. Under "Application restrictions":
   - Select "HTTP referrers (websites)"
   - Add: `https://brabsmit.github.io/*`
5. Save

This ensures the API key only works when requests come from your GitHub Pages site.

### 4. Generate the Data Files

Before deploying, make sure you have the latest family data:

```bash
# Run the pipeline to generate family_data.json
cd /home/user/Kinship
python genealogy_pipeline.py

# Optional: Generate hitlist
python generate_hitlist.py
```

The generated files are in `.gitignore`, so you'll need to temporarily commit them for the first deployment:

```bash
cd kinship-app/src
git add -f family_data.json hitlist_data.json
git commit -m "Add initial family data for deployment"
```

**Note:** You'll need to do this each time you update the genealogy data.

## Deployment Workflow

### Automatic Deployment

Once setup is complete, deployment is automatic:

1. Make your changes locally
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. GitHub Actions automatically builds and deploys
4. Check the "Actions" tab to monitor progress: https://github.com/brabsmit/Kinship/actions
5. Once complete (usually 2-3 minutes), changes are live at: https://brabsmit.github.io/Kinship/

### Manual Deployment

You can also trigger deployment manually:

1. Go to: https://github.com/brabsmit/Kinship/actions/workflows/deploy.yml
2. Click "Run workflow"
3. Select the `main` branch
4. Click "Run workflow"

## Local Testing

Before pushing, you can test the build locally:

```bash
cd kinship-app

# Build with GitHub Pages configuration
npm run build:github

# Preview the build
npm run preview:github
```

Then open your browser to the URL shown (usually http://localhost:4173)

## Updating Family Data

When the original researcher adds new information:

1. Update the Word documents
2. Run the pipeline:
   ```bash
   cd /home/user/Kinship
   python genealogy_pipeline.py
   ```
3. Commit the generated JSON files:
   ```bash
   cd kinship-app/src
   git add -f family_data.json hitlist_data.json
   git commit -m "Update family data - [brief description]"
   git push origin main
   ```
4. Wait 2-3 minutes for automatic deployment

## Sharing with Family

Once deployed, share this URL with family members:

```
https://brabsmit.github.io/Kinship/
```

They can:
- Browse the family tree
- Explore ancestors on the map
- Read biographies
- View narrative threads (Mayflower, Immigrants, etc.)

**AI Features:** Family members who want to use AI research suggestions will need to log in with the password you set in `VITE_USER_PASSWORD`.

## Troubleshooting

### Build Fails

Check the Actions tab for error messages: https://github.com/brabsmit/Kinship/actions

Common issues:
- Missing GitHub Secrets: Add them in repository settings
- Build errors: Test locally first with `npm run build:github`
- Missing data files: Make sure `family_data.json` is committed

### Site Shows 404

1. Verify GitHub Pages is enabled and set to "GitHub Actions"
2. Check that deployment succeeded in the Actions tab
3. Wait a few minutes - sometimes it takes time to propagate

### API Key Errors

If family members see "API key not working":
1. Check that `VITE_GEMINI_API_KEY` is set in GitHub Secrets
2. Verify the key is restricted to your GitHub Pages domain
3. Check API quota hasn't been exceeded: https://aistudio.google.com/app/apikey

### Images or Assets Not Loading

The app uses Wikimedia Commons for historical images. If they don't load:
- Check browser console for CORS errors
- Verify internet connection
- Some historical maps may have changed URLs - check `wikimedia_cache.json`

## Cost Considerations

**GitHub Pages:** Free for public repositories

**Google Gemini API:**
- Free tier: 15 requests per minute
- Costs only apply if you exceed free tier
- For a family site with occasional use, should remain free
- Monitor usage: https://aistudio.google.com/app/apikey

## Security Notes

- **Never commit `.env` files** - they're in `.gitignore` for a reason
- **API keys are public** in the built site - that's why we restrict them by domain
- **Password is weak** - it's just to prevent accidental AI usage, not real security
- For true privacy, consider hosting privately (Vercel password protection, etc.)

## Advanced: Custom Domain

Want to use a custom domain like `family.example.com`?

1. Buy a domain (Google Domains, Namecheap, etc.)
2. Add a `CNAME` file to `kinship-app/public/`:
   ```
   family.example.com
   ```
3. Update DNS records with your domain provider
4. Update `base` in `vite.config.js` to `/`
5. Update API key restrictions to include your custom domain

See GitHub's guide: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Support

If you encounter issues:
1. Check the Actions tab for build errors
2. Test locally with `npm run build:github && npm run preview:github`
3. Verify all GitHub Secrets are set correctly
4. Check this guide for troubleshooting steps
