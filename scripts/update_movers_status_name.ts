
const { initializeApp, getApps } = require("firebase/app");
const { getFirestore, collectionGroup, getDocs, updateDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

async function updateAllMovers() {
  const moversSnap = await getDocs(collectionGroup(db, "movers"));
  let updated = 0;
  for (const moverDoc of moversSnap.docs) {
    const data = moverDoc.data();
    let needsUpdate = false;
    const updateObj: any = {};
    if (!data.status) {
      updateObj.status = "available";
      needsUpdate = true;
    }
    if (!data.name && data.companyName) {
      updateObj.name = data.companyName;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await updateDoc(moverDoc.ref, updateObj);
      updated++;
      console.log(`Updated mover ${moverDoc.id}:`, updateObj);
    }
  }
  console.log(`Done. Updated ${updated} movers.`);
}

updateAllMovers().catch(console.error);