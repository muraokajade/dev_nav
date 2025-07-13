// --- /api/me の返却例 ---
const me = {
  "userId": "abc123",
  "displayName": "田中エンジニア",
  "email": "engineer@example.com",
  "iconUrl": "https://example.com/profiles/abc123.png",
  "joinedAt": "2024-03-01T00:00:00Z",
  "bio": "Next.js好きのReactエンジニア"
}

// --- /api/status/mine の返却例 ---
const status = {
  "articlesRead": 22,
  "reviews": 7,
  "likes": 15,
  "comments": 9,
  "level": 3,
  "expPercent": 62,
  "likedArticles": [
    { "id": 1, "title": "React基礎", "url": "/articles/1" },
    { "id": 2, "title": "TypeScript超入門", "url": "/articles/2" }
  ],
  "reviewsHistory": [
    { "id": 101, "articleTitle": "React基礎", "date": "2024-06-01", "review": "すごくわかりやすかった！" }
  ],
  "commentsHistory": [
    { "id": 201, "articleTitle": "TypeScript超入門", "date": "2024-06-03", "comment": "参考になりました！" }
  ]
}
