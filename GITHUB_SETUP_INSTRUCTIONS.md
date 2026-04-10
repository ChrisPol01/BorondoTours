# GitHub Repository Setup Instructions

Due to container environment permission restrictions, the GitHub repository creation and configuration must be completed on your PC using your GitHub CLI installation.

## Prerequisites

- GitHub CLI installed on your PC (`gh` command available)
- Git installed on your PC
- Access to ChrisPol01 GitHub account
- This repository folder cloned or available locally

## Step 1: Create Repository on GitHub

Run this command in PowerShell or your terminal with GitHub CLI:

```bash
gh repo create BorondoTours --public --source=. --remote=origin --push
```

Or create it manually on GitHub:
1. Go to https://github.com/new
2. Repository name: `BorondoTours`
3. Description: "B2C Managed Marketplace for Tourism in Colombia"
4. Public repository
5. Add README (optional - we have one)
6. Click "Create repository"

## Step 2: Push Existing Commits

If created manually, set up the remote and push:

```bash
git remote add origin https://github.com/ChrisPol01/BorondoTours.git
git branch -M main
git push -u origin main develop staging
```

## Step 3: Configure Branch Protection Rules

Run these commands to protect main and staging branches:

```bash
# Protect main branch
gh repo edit --enable-branch-protection --branch main ChrisPol01/BorondoTours

# Or manually:
# Go to https://github.com/ChrisPol01/BorondoTours/settings/branches
# Add branch protection rule for 'main':
# - Require pull request reviews before merging: 1 approval
# - Require status checks to pass before merging: ci-lint, ci-test, ci-build
# - Require branches to be up to date before merging
# - Include administrators in restrictions
```

## Step 4: Add GitHub Secrets

```bash
# Database
gh secret set DATABASE_URL --body "postgresql://user:password@localhost:5432/borondotours" -R ChrisPol01/BorondoTours

# Redis
gh secret set REDIS_URL --body "redis://localhost:6379" -R ChrisPol01/BorondoTours

# JWT
gh secret set JWT_PRIVATE_KEY --body "$(cat path/to/private.key)" -R ChrisPol01/BorondoTours
gh secret set JWT_PUBLIC_KEY --body "$(cat path/to/public.key)" -R ChrisPol01/BorondoTours

# OAuth
gh secret set GOOGLE_CLIENT_ID --body "your-google-client-id" -R ChrisPol01/BorondoTours
gh secret set GOOGLE_CLIENT_SECRET --body "your-google-secret" -R ChrisPol01/BorondoTours

# Mapbox
gh secret set MAPBOX_TOKEN --body "your-mapbox-token" -R ChrisPol01/BorondoTours

# AWS
gh secret set AWS_ACCESS_KEY_ID --body "your-aws-key" -R ChrisPol01/BorondoTours
gh secret set AWS_SECRET_ACCESS_KEY --body "your-aws-secret" -R ChrisPol01/BorondoTours
gh secret set AWS_S3_BUCKET --body "your-bucket-name" -R ChrisPol01/BorondoTours

# Staging
gh secret set STAGING_API_URL --body "https://staging-api.borondotours.com" -R ChrisPol01/BorondoTours
gh secret set VITE_API_URL --body "https://staging-api.borondotours.com" -R ChrisPol01/BorondoTours
gh secret set VITE_MAPBOX_TOKEN --body "your-mapbox-token" -R ChrisPol01/BorondoTours
```

## Step 5: Create GitHub Environments

**Staging Environment:**
```bash
gh environment create staging -R ChrisPol01/BorondoTours

# Set deployment branches restriction to staging
gh api -X PUT "repos/ChrisPol01/BorondoTours/environments/staging" \
  -f deployment_branch_policy='{type:"protected"}' \
  -f protection_rules='[{type:"required_status_checks",status_checks:[{context:"ci-lint"},{context:"ci-test"},{context:"ci-build"}]}]'
```

**Production Environment:**
```bash
gh environment create production -R ChrisPol01/BorondoTours

# Set deployment branches restriction to main only
gh api -X PUT "repos/ChrisPol01/BorondoTours/environments/production" \
  -f deployment_branch_policy='{type:"protected",custom_branch_policies:true,branches:"main"}' \
  -f protection_rules='[{type:"required_status_checks",status_checks:[{context:"ci-lint"},{context:"ci-test"},{context:"ci-build"}]}]'
```

## Step 6: Verify Repository Configuration

```bash
# Check if repository exists and is configured
gh repo view ChrisPol01/BorondoTours --json nameWithOwner,description,isPrivate,hasIssuesEnabled,hasWikiEnabled

# Check branches
gh api -X GET repos/ChrisPol01/BorondoTours/branches

# Check secrets (list only names, not values)
gh secret list -R ChrisPol01/BorondoTours

# Check environments
gh environment list -R ChrisPol01/BorondoTours
```

## Troubleshooting

**"gh command not found"**
- Install GitHub CLI from https://cli.github.com/
- On Windows: Use `choco install gh` or download installer
- On Mac: Use `brew install gh`
- On Linux: Use package manager or download binary

**"Could not resolve to a Repository"**
- Verify you're authenticated: `gh auth status`
- Check repository name: should be exactly `BorondoTours`
- Verify it's in your account: `gh repo list`

**Permission denied errors**
- Run `gh auth login` to re-authenticate
- Use `gh auth refresh` to refresh token
- May need to create a personal access token with repo scope

## Git Flow Workflow Reference

After setup, use this workflow:

```bash
# Feature development
git checkout develop
git pull origin develop
git checkout -b feature/feature-name
# ... make changes ...
git add .
git commit -m "Add feature description"
git push origin feature/feature-name
# Create Pull Request to develop

# Release preparation
git checkout -b release/version main
# ... version bumping ...
git push origin release/version

# Hotfix
git checkout hotfix/hotfix-name -b hotfix/hotfix-name main
# ... fix bug ...
git push origin hotfix/hotfix-name
# Create Pull Request to main and develop
```

## Next Steps

1. Complete steps 1-4 on your PC with GitHub CLI
2. Verify the repository appears at https://github.com/ChrisPol01/BorondoTours
3. Check that all secrets are configured
4. Verify CI/CD workflows run on push to any branch
5. Begin feature development on the `develop` branch
