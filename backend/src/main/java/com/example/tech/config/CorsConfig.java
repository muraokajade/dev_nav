// CorsConfig.java
package com.example.tech.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.context.annotation.Primary; // ★ 追加
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;
import java.util.stream.Stream;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:https://www.devnav.tech,https://devnav.tech,http://localhost:*}")
    private String allowedOrigins;
    @Value("${app.cors.allowed-headers:*}") private String allowedHeaders;
    @Value("${app.cors.exposed-headers:Location,Content-Disposition}") private String exposedHeaders;
    @Value("${app.cors.allow-credentials:true}") private boolean allowCredentials;
    @Value("${app.cors.max-age-seconds:3600}") private long maxAgeSeconds;

    @Bean
    @Primary // ★ これで自作の CorsConfigurationSource を優先
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        Stream.of(allowedOrigins.split(",")).map(String::trim).filter(s->!s.isEmpty()).forEach(cfg::addAllowedOriginPattern);
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        Stream.of(allowedHeaders.split(",")).map(String::trim).filter(s->!s.isEmpty()).forEach(cfg::addAllowedHeader);
        Stream.of(exposedHeaders.split(",")).map(String::trim).filter(s->!s.isEmpty()).forEach(cfg::addExposedHeader);
        cfg.setAllowCredentials(allowCredentials);
        cfg.setMaxAge(maxAgeSeconds);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }

    @Bean(name = "corsFilterRegistration")
    public FilterRegistrationBean<CorsFilter> corsFilterRegistration(
            @Qualifier("corsConfigurationSource") CorsConfigurationSource source // ★ 明示的に指定
    ) {
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
