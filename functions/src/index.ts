// functions/src/index.ts

import { onObjectFinalized } from "firebase-functions/v2/storage";
import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as ffmpeg from "fluent-ffmpeg";
import * as ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { Storage } from "@google-cloud/storage";

admin.initializeApp();
const storage = new Storage();

// --- 1. 動画アップロード時：自動サムネイル生成 ---
export const generateVideoThumbnail = onObjectFinalized(
  {
    region: "asia-northeast1", // バケットのリージョンと合わせる
    memory: "1GiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    const object = event.data;
    const fileBucket = object.bucket;
    const filePath = object.name || "";
    const contentType = object.contentType || "";
    if (!contentType.startsWith("video/")) return null;

    const fileName = path.basename(filePath);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const bucket = storage.bucket(fileBucket);
    await bucket.file(filePath).download({ destination: tempFilePath });

    // サムネイルファイル名
    const thumbFileName = fileName.replace(/\.[^/.]+$/, "") + "_thumb.jpg";
    const thumbFilePath = path.join(os.tmpdir(), thumbFileName);

    // ffmpegでサムネ生成（動画1秒地点）
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .on("end", resolve)
        .on("error", reject)
        .screenshots({
          count: 1,
          folder: os.tmpdir(),
          filename: thumbFileName,
          size: "320x?",
          timemarks: ["1"]
        });
    });

    // Storageにサムネアップ
    const thumbStoragePath = filePath.replace(/^(media\/)/, "media_thumbs/").replace(/\.[^/.]+$/, "_thumb.jpg");
    await bucket.upload(thumbFilePath, { destination: thumbStoragePath, contentType: "image/jpeg" });

    // サムネ公開URL取得
    const [thumbFile] = await bucket.file(thumbStoragePath).get();
    const [thumbUrl] = await thumbFile.getSignedUrl({
      action: "read",
      expires: "03-09-2099"
    });

    // FirestoreにthumbnailUrlを追記
    const mediaRef = admin.firestore().collection("media");
    const snap = await mediaRef.where("url", "==", `https://storage.googleapis.com/${fileBucket}/${filePath}`).get();
    if (!snap.empty) {
      const docId = snap.docs[0].id;
      await mediaRef.doc(docId).update({ thumbnailUrl: thumbUrl });
    }

    // 一時ファイル削除
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(thumbFilePath);
    return null;
  }
);

// --- 2. 管理画面からユーザー属性を付与：カスタムクレームAPI ---
export const setCustomClaims = onCall(
  { region: "asia-northeast1" }, // v2形式＋リージョン統一
  async (request) => {
    const context = request.auth;
    if (!context?.token?.admin) {
      throw new Error("permission-denied");
    }
    const { uid, claims } = request.data;
    if (!uid || !claims) {
      throw new Error("invalid-argument");
    }

    // カスタムクレーム付与
    await admin.auth().setCustomUserClaims(uid, claims);

    // Firestoreのusersコレクションにも反映（お好みで）
    await admin.firestore().collection("users").doc(uid).set(claims, { merge: true });

    return { success: true };
  }
);

