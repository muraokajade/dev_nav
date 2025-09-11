package com.example.tech.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    /**
     * Spring Security の .cors() から参照される唯一の CORS 設定。
     * ※ ここだけに集約（他で CORS を定義しない）
     */
    @Bean
    @Primary
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        // 本番フロントのオリジンを固定で許可（credentials=true の場合は * ではなく固定値にする）
        cfg.setAllowedOrigins(List.of(
                "https://www.devnav.tech",
                "https://devnav.tech",
                "http://localhost:3000"   // 開発用（不要なら削除）
        ));

        // プリフライトを通すため OPTIONS を必ず含める
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Authorization 等を通す
        cfg.setAllowedHeaders(List.of("*"));

        // ブラウザから見せたいレスポンスヘッダ（必要に応じて追加）
        cfg.setExposedHeaders(List.of("Location", "Content-Disposition"));

        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
