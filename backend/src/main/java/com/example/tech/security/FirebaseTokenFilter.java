// src/main/java/com/example/tech/security/FirebaseTokenFilter.java
package com.example.tech.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // プリフライトはスキップ
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        // 公開API（認証不要）はフィルタをスキップ
        return path.startsWith("/api/articles")
                || path.startsWith("/api/syntaxes")
                || path.startsWith("/api/procedures")
                || (path.equals("/api/messages") && "GET".equalsIgnoreCase(request.getMethod()))
                || path.startsWith("/api/review-scores")
                || path.startsWith("/api/review-comments")
                || (path.equals("/api/likes/count") && "GET".equalsIgnoreCase(request.getMethod()))
                || path.equals("/api/register");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractBearerToken(request);

        if (token != null) {
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String email = decodedToken.getEmail();
                Boolean isAdmin = (Boolean) decodedToken.getClaims().get("admin");

                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority(Boolean.TRUE.equals(isAdmin) ? "ROLE_ADMIN" : "ROLE_USER"));

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (FirebaseAuthException e) {
                // 無効/期限切れトークンでもここでは401を返さない（公開APIで落ちないようにする）
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) return null;

        String raw = header.substring(7).trim();
        if (raw.isEmpty()) return null;

        String lower = raw.toLowerCase();
        if ("null".equals(lower) || "undefined".equals(lower)) return null; // 本番でありがちな値を無効扱い
        return raw;
    }
}
