package com.example.tech.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.*;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) return FirebaseApp.getInstance();

        InputStream cred = null;

        // 1) 本番: 環境変数（JSON文字列）を優先
        String json = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");
        if (json != null && !json.isBlank()) {
            cred = new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8));
            System.out.println("[Firebase] using ENV FIREBASE_SERVICE_ACCOUNT_JSON");
        }

        // 2) 予備: GOOGLE_APPLICATION_CREDENTIALS（絶対パス）対応
        if (cred == null) {
            String gac = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
            if (gac != null && !gac.isBlank()) {
                cred = new FileInputStream(gac);
                System.out.println("[Firebase] using GOOGLE_APPLICATION_CREDENTIALS file: " + gac);
            }
        }

        // 3) 開発: クラスパスのjson
        if (cred == null) {
            ClassPathResource cpr = new ClassPathResource("firebase/firebase-service-account.json");
            if (cpr.exists()) {
                cred = cpr.getInputStream();
                System.out.println("[Firebase] using classpath firebase/firebase-service-account.json");
            }
        }

        if (cred == null) {
            throw new IOException("Firebase credentials not found (ENV JSON / GAC file / classpath).");
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(cred))
                .build();

        return FirebaseApp.initializeApp(options);
    }
}
