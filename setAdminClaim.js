const admin = require("firebase-admin");
// ファイル名を合わせる
const serviceAccount = require("./ikejirisensei-firebase-adminsdk-fbsvc-2884b41a40.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const targetUid = "5lZSUMwXrYQrpkeg3o8qJ34S3nR2"; // あなたのユーザーUID

admin.auth().setCustomUserClaims(targetUid, { admin: true })
  .then(() => {
    console.log(`admin:true をUID: ${targetUid} に付与しました。`);
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
