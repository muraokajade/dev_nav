import React, { useEffect, useState } from "react";
import axios from "axios";

const TestApiCall = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // データをAPIから取得
  useEffect(() => {
    axios
      .get(
        "https://chosen-shelba-chokai-engineering-61f48841.koyeb.app/api/articles?page=0&size=10"
      )
      .then((response) => {
        setData(response.data); // 取得したデータをstateに保存
      })
      .catch((err) => {
        setError("API接続に失敗しました");
        console.error(err);
      });
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>APIから取得したデータ</h1>
      {data ? (
        <ul>
          {data.content.map((article: any, index: number) => (
            <li key={index}>{article.title}</li> // 仮にtitleがあると仮定
          ))}
        </ul>
      ) : (
        <p>データを読み込み中...</p>
      )}
    </div>
  );
};

export default TestApiCall;
