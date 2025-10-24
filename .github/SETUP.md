# CI/CD Setup Guide

This document explains how to set up the GitHub Actions CI/CD pipeline for this project.

## Prerequisites

- GitHub repository
- Firebase project
- SonarCloud account

## Setup Steps

### 1. Firebase Setup

1. Go to your Firebase project console
2. Navigate to Project Settings > Service Accounts
3. Click "Generate New Private Key"
4. Download the JSON file
5. In your GitHub repository, go to Settings > Secrets and variables > Actions
6. Create a new secret named `FIREBASE_SERVICE_ACCOUNT`
7. Paste the entire contents of the JSON file as the secret value

### 2. SonarCloud Setup

1. Go to [SonarCloud](https://sonarcloud.io/)
2. Log in with your GitHub account
3. Click "+" in the top right and select "Analyze new project"
4. Select your repository
5. Follow the setup wizard to get your organization key and project key
6. Update the `sonar-project.properties` file in the root directory:
   - Replace `YOUR_ORGANIZATION_KEY` with your SonarCloud organization key
   - Replace `YOUR_PROJECT_KEY` with your unique project key
7. In SonarCloud, go to your project > Administration > Analysis Method
8. Disable "Automatic Analysis"
9. Go to your account settings > Security > Generate Token
10. Copy the token
11. In your GitHub repository, go to Settings > Secrets and variables > Actions
12. Create a new secret named `SONAR_TOKEN`
13. Paste the token as the secret value

### 3. GitHub Secrets Summary

Your repository should have the following secrets configured:

- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON
- `SONAR_TOKEN`: SonarCloud authentication token
- `GITHUB_TOKEN`: (Automatically provided by GitHub Actions)

## Workflow Details

The CI/CD pipeline runs on:
- Every push to the `main` branch
- Every pull request to the `main` branch

### Pipeline Steps

1. **Checkout Code**: Fetches the repository code
2. **Setup Node.js**: Installs Node.js 20
3. **Install Dependencies**: Runs `npm ci` for clean install
4. **Run Linting**: Checks code formatting with Prettier
5. **Run Tests**: Executes unit tests with code coverage
6. **Build Application**: Creates production build
7. **SonarCloud Scan**: Analyzes code quality and coverage
8. **Deploy to Firebase**: Deploys to Firebase Hosting (main branch only)

## Local Testing

To test the workflow steps locally:

```bash
# Run linting
npm run format:check

# Run tests with coverage
npm run test -- --no-watch --code-coverage

# Build for production
npm run build -- --configuration production

# Deploy to Firebase (requires Firebase CLI setup)
npm run deploy
```

## Troubleshooting

### Tests Fail in CI but Pass Locally
- Ensure all tests can run in headless Chrome
- Check for timing issues or browser-specific code

### SonarCloud Analysis Fails
- Verify `SONAR_TOKEN` secret is set correctly
- Ensure `sonar-project.properties` has correct organization and project keys
- Check that coverage files are generated in the correct location

### Firebase Deployment Fails
- Verify `FIREBASE_SERVICE_ACCOUNT` secret is valid JSON
- Ensure the service account has the correct permissions
- Check that the Firebase project ID matches in `firebase.json`

## Additional Configuration

### Custom Deployment Channels

To deploy to preview channels, modify the workflow:

```yaml
- name: Deploy to Firebase Preview
  uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: ${{ secrets.GITHUB_TOKEN }}
    firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
    channelId: preview
    projectId: f1standings
```

### Branch Protection Rules

Consider setting up branch protection rules for `main`:
1. Go to Settings > Branches
2. Add rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select the CI/CD workflow checks
5. Enable "Require branches to be up to date before merging"
