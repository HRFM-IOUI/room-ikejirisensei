// src/firebaseAdmin.ts
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// .envでFIREBASE_ADMIN_SDK_KEY_JSONにサービスアカウントJSON（文字列）をセット
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY_JSON || "{}");

const adminApp = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert(serviceAccount),
    });

export const adminAuth = getAuth(adminApp);
