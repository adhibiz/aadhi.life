import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import readline from 'readline';
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=== Set Firebase Admin Claim ===");

rl.question('Enter existing admin email: ', async (email) => {
  try {
    const userRecord = await getAuth().getUserByEmail(email);
    await getAuth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`\nSuccess! Admin claim set.`);
    console.log(`UID: ${userRecord.uid}`);
    console.log(`Email: ${userRecord.email}`);
  } catch (error) {
    console.error("\nError setting admin claim:", error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
});
