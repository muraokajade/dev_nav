const axios = require('axios');
const dummyProcedures = require('./dummyProcedures.cjs'); // さっき作ったファイルをimport

// APIのエンドポイント
const API_URL = 'http://localhost:8080/api/admin/add-procedure'; // ←あなたの環境に合わせて


const ID_TOKEN =  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjZkZTQwZjA0ODgxYzZhMDE2MTFlYjI4NGE0Yzk1YTI1MWU5MTEyNTAiLCJ0eXAiOiJKV1QifQ.eyJhZG1pbiI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL3JlYWN0LWZpcmViYXNlLWF1dGgtYXBwLTQ5ODFiIiwiYXVkIjoicmVhY3QtZmlyZWJhc2UtYXV0aC1hcHAtNDk4MWIiLCJhdXRoX3RpbWUiOjE3NTMyMTI3OTksInVzZXJfaWQiOiI5S1hSQ3lXazRIVHZDdlZVTk82UVFhSm1sUUUyIiwic3ViIjoiOUtYUkN5V2s0SFR2Q3ZWVU5PNlFRYUptbFFFMiIsImlhdCI6MTc1MzIxNzM0MywiZXhwIjoxNzUzMjIwOTQzLCJlbWFpbCI6ImthbmVtaWNoaS5qYWRlQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImthbmVtaWNoaS5qYWRlQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.fmQiArOr9IHfiZ-kCzc1Nnn5_mWqc2RD8vh0trBQPpr0Y5epkL8Xp4W5qpi0yOWOir4NsLvcP8__dnAKstgYAcM-aA-kSDnmSXl-9IPgCKPc-8JODBadfWzI5sVlEyJMs31YqwESHemD5x65-il87ThBslaB4mz7nhd9ZysMxUHZyOirIImmIECwctOhOMjPhXPgwq_1Ik5fM1n925bXVzRpQXSrbF2j9YxhAOSv3nKVUUdeu6fNsHc4ZYABe7vTy8iMrwvL2gf6lCyV9hYu14T64DwkkKvS4pCVqpHTZ3mpTMoUoDmvl4fefAMdbVdAT-CP5z3zqt7Qg-CkLttmgQ';// 認証必要なら

// 1件ずつPOST
(async () => {
  for (const item of dummyProcedures) {
    try {
      const res = await axios.post(API_URL, item, {
        headers: {
          Authorization: `Bearer ${ID_TOKEN}`,
        },
      });
      console.log(`投稿成功: ${item.title}`);
    } catch (err) {
      console.error(`投稿失敗: ${item.title}`, err.response?.data || err.message);
    }
  }
})();
