import admin from "firebase-admin";
import serviceAccount from "./account.json";


export const adminApp = admin.apps.length === 0 ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    databaseURL: "https://remox-dao-default-rtdb.firebaseio.com"
}, "admin") : admin.app("admin");