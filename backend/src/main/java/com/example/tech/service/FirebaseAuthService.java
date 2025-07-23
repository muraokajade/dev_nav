package com.example.tech.service;

import com.example.tech.entity.ProcedureEntity;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
@Service
public class FirebaseAuthService {

    /**
     * トークンを検証し、admin権限を持っていれば email を返す。
     * 権限がない or トークン無効なら例外スロー。
     */
    public String verifyAdminAndGetEmail(String token) {
        String idToken = token.replace("Bearer ", "");

        FirebaseToken decodedToken;
        try {
            decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch(FirebaseAuthException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"トークンの検証に失敗しました。");
        }

        boolean isAdmin = Boolean.TRUE.equals(decodedToken.getClaims().get("admin"));

        if(!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"管理者のみが実行できます。");
        }

        return decodedToken.getEmail();
    }
    public String verifyAndGetEmail(String token) {
        String idToken = token.replace("Bearer ", "");

        FirebaseToken decodedToken;
        try {
            decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch(FirebaseAuthException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"トークンの検証に失敗しました。");
        }

        // admin権限のチェックは不要！
        return decodedToken.getEmail();
    }

}
