import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import readline from 'readline';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

// Ensure you have initialized Firebase Admin SDK correctly using a service account key
// Download your serviceAccountKey.json from Firebase Console > Project Settings > Service Accounts
// and place it in the scripts folder.
try {
  const serviceAccount = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=== Create Firebase Admin Account ===");

rl.question('Enter Admin Email: ', (email) => {
  rl.question('Enter Admin Password: ', async (password) => {
    try {
      const userRecord = await getAuth().createUser({
        email: email,
        password: password,
      });
      await getAuth().setCustomUserClaims(userRecord.uid, { admin: true });
      console.log(`\nSuccess! Admin account created.`);
      console.log(`Admin claim set: true`);
      console.log(`UID: ${userRecord.uid}`);
      console.log(`Email: ${userRecord.email}`);
    } catch (error) {
      console.error("\nError creating new user:", error.message);
    } finally {
      rl.close();
      process.exit(0);
    }
  });
});
