# Workouts App - Expo Deployment

## Deploy to Expo Go

1. Install Expo Go on your iPhone from the App Store
2. Log in to your Expo account:
   ```bash
   npx expo login
   ```
3. Configure EAS Update:
   ```bash
   npx eas update:configure
   ```
4. Publish your update:
   ```bash
   npx eas update --branch preview --message "Initial publish"
   ```
5. Open Expo Go on your iPhone and log in with the same account
6. Your app will be available in the "Projects" tab
