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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    private static final AntPathMatcher PM = new AntPathMatcher();

    /** 公開GETとして素通りさせるパターン */
    private static final String[] PUBLIC_GETS = {
            "/api/articles/**",
            "/api/syntaxes/**",
            "/api/procedures/**",
            "/api/procedure/**",            // ← 単数系も許可
            "/api/*/*/*/messages",          // 例: /api/procedure/45/comment/messages
            "/api/*/*/*/messages/**",
            "/api/review-scores/**",
            "/api/review-comments/**",
            "/api/likes/count",
            "/api/register"
    };

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        final String method = request.getMethod();
        final String path = request.getRequestURI();

        // プリフライト/HEADは常にスキップ
        if ("OPTIONS".equalsIgnoreCase(method) || "HEAD".equalsIgnoreCase(method)) return true;

        // 公開GETはスキップ
        if ("GET".equalsIgnoreCase(method)) {
            for (String p : PUBLIC_GETS) {
                if (PM.match(p, path)) return true;
            }
        }

        // Authorization ヘッダが無い/不正（null, undefined, 空）の場合はスキップ＝匿名で後段へ
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) return true;
        String raw = header.substring(7).trim();
        if (raw.isEmpty()) return true;
        String lower = raw.toLowerCase();
        if ("null".equals(lower) || "undefined".equals(lower)) return true;

        // ここまで来たら検証対象
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String token = request.getHeader("Authorization").substring(7).trim();

        try {
            FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(token);

            String email = decoded.getEmail();
            boolean isAdmin = Boolean.TRUE.equals(decoded.getClaims().get("admin"));

            var auth = new UsernamePasswordAuthenticationToken(
                    email, null, List.of(new SimpleGrantedAuthority(isAdmin ? "ROLE_ADMIN" : "ROLE_USER"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (FirebaseAuthException e) {
            // 無効/期限切れトークンでもここでは401を返さない（後段の例外ハンドラ/認可に委ねる）
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}
