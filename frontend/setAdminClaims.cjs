const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
});

const uid = "9KXRCyWk4HTvCvVUNO6QQaJmlQE2";

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`ユーザー${uid}にadminクレームを付与しました。`);
    process.exit();
  })
  .catch((e) => {
    console.error("エラー", e);
    process.exit(1);
  });
