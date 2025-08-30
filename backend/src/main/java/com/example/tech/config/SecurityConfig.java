package com.example.tech.config;

import com.example.tech.security.FirebaseTokenFilter;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                        .accessDeniedHandler((req, res, e) -> res.sendError(HttpServletResponse.SC_FORBIDDEN))
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/**").permitAll()
                        .requestMatchers("/api/register").permitAll()
                        .requestMatchers("/api/admin/**", "/api/messages/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/articles/**").permitAll()
                        .requestMatchers("/api/syntaxes/**").permitAll()
                        .requestMatchers("/api/procedures/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/*/read/all").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/*/read/status").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/*/*/read").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/messages").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/review-scores/**", "/api/review-comments/**").permitAll()
                        .requestMatchers("/api/review-scores/**", "/api/review-comments/**").authenticated() // レビュー・コメントはログイン必須
                        .requestMatchers(HttpMethod.GET, "/api/likes/count").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/likes/status").authenticated()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                ).addFilterBefore(new FirebaseTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "https://www.devnav.tech", "https://devnav.tech"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // Cookie等が必要な場合のみ

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
