package com.example.tech.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * ここでは CORS を定義しない（Security + CorsConfig に集約）。
 * 静的リソース等の MVC 設定だけ残す。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 必要ならそのまま（本番パスは環境に合わせて）
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/Users/muraokakanemichi/Desktop/tech-app/backend/uploads/");
    }
}
