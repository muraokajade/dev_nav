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
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class FirebaseTokenFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // 公開API（認証不要API）はフィルター自体を無効化
        return path.startsWith("/api/articles");
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = getTokenFromHeader(request); // AuthorizationヘッダーからBearerトークン抽出

        if (token != null) {
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
                String email = decodedToken.getEmail();
                Boolean isAdmin = (Boolean) decodedToken.getClaims().get("admin");

                List<GrantedAuthority> authorities = new ArrayList<>();
                if (Boolean.TRUE.equals(isAdmin)) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                } else {
                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                }

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        email, null, authorities
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (FirebaseAuthException e) {
                // ★ ここが重要：401を返してチェーンを打ち切る
                SecurityContextHolder.clearContext();
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                return;

            }
        }

        filterChain.doFilter(request, response);
    }
    private String getTokenFromHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
