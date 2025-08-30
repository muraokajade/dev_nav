package com.example.tech.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            // Koyebの環境変数からfirebase-serviceの値を取得
            String firebaseServiceAccountJson = System.getenv("firebase-service");

            if (firebaseServiceAccountJson == null || firebaseServiceAccountJson.isEmpty()) {
                throw new IOException("Firebase service account is not set in the environment variables.");
            }

            // JSON文字列をバイトストリームに変換
            ByteArrayInputStream serviceAccountStream = new ByteArrayInputStream(firebaseServiceAccountJson.getBytes());

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                    .build();

            // FirebaseAppがまだ初期化されていない場合のみ初期化
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

            System.out.println("✅ Firebase initialized");
        } catch (IOException e) {
            // エラーが発生した場合にスタックトレースを出力
            e.printStackTrace();
        }
    }
}
