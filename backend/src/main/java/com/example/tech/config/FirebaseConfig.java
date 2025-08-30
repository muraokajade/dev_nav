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
            String firebaseServiceAccountJson = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");

            if (firebaseServiceAccountJson != null) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(
                                new ByteArrayInputStream(firebaseServiceAccountJson.getBytes())))
                        .build();

                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                }

                System.out.println("✅ Firebase initialized");
            } else {
                throw new IOException("Firebase service account is not set in the environment variables.");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
