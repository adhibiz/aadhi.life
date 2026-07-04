import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

try {
  const serviceAccount = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  process.exit(1);
}

const makeAllAdmins = async () => {
  try {
    const listUsersResult = await getAuth().listUsers();
    if (listUsersResult.users.length === 0) {
      console.log("No registered users found in Firebase Auth.");
    }
    for (const userRecord of listUsersResult.users) {
      await getAuth().setCustomUserClaims(userRecord.uid, { admin: true });
      console.log(`Successfully assigned admin claim to: ${userRecord.email}`);
    }
  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    process.exit(0);
  }
};

makeAllAdmins();
