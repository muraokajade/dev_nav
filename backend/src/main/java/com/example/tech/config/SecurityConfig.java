package com.example.tech.config;

import com.example.tech.security.FirebaseTokenFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final FirebaseTokenFilter firebaseTokenFilter;         // @Component 付き
    private final CorsConfigurationSource corsConfigurationSource; // CorsConfig から注入

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // ここで CorsConfig の設定を使う（これ以外で CORS 定義しない）
                .cors(c -> c.configurationSource(corsConfigurationSource))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                        .accessDeniedHandler((req, res, e) -> res.sendError(HttpServletResponse.SC_FORBIDDEN))
                )
                .authorizeHttpRequests(auth -> auth
                        // プリフライト/HEAD は常に許可
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/api/**").permitAll()

                        // 公開 API（認証不要）
                        .requestMatchers("/api/articles/**").permitAll()
                        .requestMatchers("/api/syntaxes/**").permitAll()
                        .requestMatchers("/api/procedures/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/messages").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/review-scores/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/review-comments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/likes/count").permitAll()
                        .requestMatchers("/api/register").permitAll()

                        // 認証が必要
                        .requestMatchers("/api/admin/**", "/api/messages/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/*/read/all").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/*/read/status").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/*/*/read").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/likes/status").authenticated()

                        // それ以外の /api/** は認証必須
                        .requestMatchers("/api/**").authenticated()

                        // 静的等は許可
                        .anyRequest().permitAll()
                )
                // 自前の Firebase フィルタを適用
                .addFilterBefore(firebaseTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
