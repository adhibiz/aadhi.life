# Firebase Backend Setup Guide

This guide walks you through setting up the complete Firestore architecture for `aadhi.life`.

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g., `aadhi-life`).
3. Disable Google Analytics (optional, you can enable it later if needed).

## 2. Enable Authentication
1. Navigate to **Build > Authentication** in the left sidebar.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Email/Password**.
4. Enable the **Email/Password** toggle and click **Save**.

## 3. Enable Firestore Database
1. Navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode** (we will deploy our secure rules later).
4. Choose a region close to you (e.g., `asia-south1` for India) and click **Create**.

## 4. Get Client Config (for React)
1. Go to Project Settings (gear icon next to "Project Overview").
2. Under "Your apps", click the Web icon (`</>`) to add a web app.
3. Name it (e.g., `aadhi-life-web`) and register.
4. Copy the `firebaseConfig` object values.
5. Create a `.env` file in the root of your `aadhi.life` code directory and paste them:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

## 5. Get Server Config (for Admin Scripts)
1. In Project Settings, go to the **Service accounts** tab.
2. Click **Generate new private key**.
3. Save the downloaded JSON file into your `scripts/` folder and rename it exactly to `serviceAccountKey.json`.
4. *Important:* Ensure `scripts/serviceAccountKey.json` is listed in your `.gitignore` to prevent leaking your private key!

## 6. Install Dependencies
In your terminal at the root of the project, install the Firebase tools and admin SDK:
```bash
npm install firebase-admin dotenv
npm install -g firebase-tools
```

## 7. Create Your Admin Account
Run the admin creation script. It will prompt you to enter the email and password you want to use to log into your admin dashboard.
```bash
node scripts/create-admin.js
```
*Note down the email and password you used.*

## 8. Seed the Database
Run the seed script to populate Firestore with all your real content (projects, blogs, timeline, skills, etc.).
```bash
node scripts/seed.js
```

## 9. Deploy Security Rules
We have created a `firestore.rules` file in the root of the project that ensures only you (the authenticated admin) can edit your content, while guests can only add pending messages to the guestbook.

1. Login to Firebase CLI:
```bash
firebase login
```
2. Initialize Firebase (if not already done):
```bash
firebase init firestore
```
*(Select your project, choose the existing `firestore.rules` file, and don't overwrite it).*

3. Deploy the rules:
```bash
firebase deploy --only firestore:rules
```

## Done!
Your backend is completely set up. You can now use the `/admin/login` page on your React app to sign in and manage your site!
