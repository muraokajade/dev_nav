package com.example.tech.controller;

import com.example.tech.dto.ArticleDTO;
import com.example.tech.dto.SyntaxDTO;
import com.example.tech.dto.request.ArticleRequest;
import com.example.tech.dto.request.SyntaxRequest;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final FirebaseAuthService firebaseAuthService;

    @GetMapping("/articles")
    public ResponseEntity<List<ArticleDTO>> getAllArticle(@RequestHeader(name = "Authorization") String token)
    {
        List<ArticleDTO> articles = adminService.getAllArticles();
        return ResponseEntity.ok(articles);
    }

    @GetMapping("/syntaxes")
    public ResponseEntity<List<SyntaxDTO>> getAllSyntax(@RequestHeader(name = "Authorization") String token)
    {
        List<SyntaxDTO> articles = adminService.getAllSyntax();
        return ResponseEntity.ok(articles);
    }



    @PostMapping("/add-article")
    public ResponseEntity<?> postArticle(@RequestHeader(name = "Authorization") String token,
                                         @RequestParam("image") MultipartFile imageFile,
                                         @ModelAttribute ArticleRequest request)
    {
        System.out.println("called!");
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);

        String uploadDir = "uploads/";
        File dir = new File(uploadDir);
        System.out.println("保存先ディレクトリ: " + dir.getAbsolutePath());
        if (!dir.exists()) {
            boolean result = dir.mkdirs();
            System.out.println("ディレクトリ作成成功？: " + result);
            if (!result) {
                return ResponseEntity.status(500).body("ディレクトリ作成に失敗しました");
            }
        }
        String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
        File dest = new File(dir.getAbsolutePath() + File.separator + fileName); // ←絶対パス
        System.out.println("ファイル保存先: " + dest.getAbsolutePath());


        // 3. 保存
        try {
            imageFile.transferTo(dest);
        } catch (IOException e) {
            System.out.println("画像保存エラー: " + e.getMessage());
            e.printStackTrace(); // ← 追加！
            return ResponseEntity.status(500).body("画像保存エラー");
        }

        // 2. 公開URLを組み立てる（nginxなどで /images/ → /path/to/upload/ を公開してる想定）
        String imageUrl = "/images/" + fileName;

        adminService.postArticles(request, adminEmail,imageUrl);
        return ResponseEntity.ok("投稿完了");
    }

    @PostMapping("/add-syntax")
    public ResponseEntity<?> postArticle(@RequestHeader(name = "Authorization") String token,
                                         @RequestBody SyntaxRequest request)
    {
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        adminService.postSyntax(request, adminEmail);
        return ResponseEntity.ok("投稿完了");
    }
}
