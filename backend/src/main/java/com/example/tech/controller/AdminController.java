package com.example.tech.controller;

import com.example.tech.dto.ArticleDTO;
import com.example.tech.dto.ProcedureDTO;
import com.example.tech.dto.SyntaxDTO;
import com.example.tech.dto.request.ArticleRequest;
import com.example.tech.dto.request.ProcedureRequest;
import com.example.tech.dto.request.SyntaxRequest;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.AdminService;
import com.example.tech.service.ProcedureService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final FirebaseAuthService firebaseAuthService;
    private final ProcedureService procedureService;

    @GetMapping("/articles")
    public ResponseEntity<Page<ArticleDTO>> getAllArticle(@RequestHeader(name = "Authorization") String token,
                                                          @RequestParam int page,
                                                          @RequestParam int size)
    {
        Pageable pageable = PageRequest.of(page,size);
        Page<ArticleDTO> articles = adminService.getAllArticles(pageable);
        return ResponseEntity.ok(articles);
    }

    @GetMapping("/syntaxes")
    public ResponseEntity<Page<SyntaxDTO>> getAllSyntax(@RequestHeader(name = "Authorization") String token,
                                                        @RequestParam int page,
                                                        @RequestParam int size)
    {
        Pageable pageable = PageRequest.of(page,size);
        Page<SyntaxDTO> articles = adminService.getAllSyntax(pageable);
        return ResponseEntity.ok(articles);
    }

    @PostMapping("/add-article")
    public ResponseEntity<?> postArticle(@RequestHeader(name = "Authorization") String token,
                                         @RequestParam(value = "image", required = false) MultipartFile imageFile,
                                         @ModelAttribute ArticleRequest request)
    {
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);

        // 2. 保存ディレクトリの準備（プロジェクト直下のuploads）
        // 画像URLをnullで初期化（デフォは「画像なし」）
        String imageUrl = null;
        // imageFileがnullでなく、かつ空でなければ画像保存
        if (imageFile != null && !imageFile.isEmpty()) {
            // 1. 保存ディレクトリの準備
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                return ResponseEntity.status(500).body("ディレクトリ作成に失敗しました");
            }

            // 2. ファイル名をユニークに生成
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
            File dest = new File(dir, fileName);

            // 3. 保存
            try {
                imageFile.transferTo(dest);
                // 4. 公開URLを組み立て
                imageUrl = "/uploads/" + fileName;
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("画像保存エラー");
            }
        }


        adminService.postArticles(request, adminEmail,imageUrl);
        return ResponseEntity.ok("投稿完了");
    }

    @PostMapping("/add-procedure")
    public ResponseEntity<?> postProcedure(
            @RequestHeader(name = "Authorization") String token,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @ModelAttribute ProcedureRequest request
    ) {
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);

        // 画像URLをnullで初期化（デフォは「画像なし」）
        String imageUrl = null;
        // imageFileがnullでなく、かつ空でなければ画像保存
        if (imageFile != null && !imageFile.isEmpty()) {
            // 1. 保存ディレクトリの準備
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                return ResponseEntity.status(500).body("ディレクトリ作成に失敗しました");
            }

            // 2. ファイル名をユニークに生成
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
            File dest = new File(dir, fileName);

            // 3. 保存
            try {
                imageFile.transferTo(dest);
                // 4. 公開URLを組み立て
                imageUrl = "/uploads/" + fileName;
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("画像保存エラー");
            }
        }

        // imageUrlがnullなら画像なし、それ以外は画像ありで保存
        procedureService.postProcedure(adminEmail, request, imageUrl);
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
    @PutMapping("/articles/{slug}/toggle")
    public ResponseEntity<?> toggleArticlePublished(@RequestHeader(name = "Authorization")String token,
                                             @PathVariable String slug)
    {
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        adminService.togglePublished(slug);
        return ResponseEntity.ok("公開非公開反転しました。");
    }

    @PutMapping("/syntaxes/{id}/toggle")
    public ResponseEntity<?> toggleSyntaxesPublished(@RequestHeader(name = "Authorization")String token,
                                                    @PathVariable Long id)
    {
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        adminService.toggleSyntaxPublished(id);
        return ResponseEntity.ok("公開非公開反転");
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<ArticleDTO> getArticleById(@RequestHeader(name = "Authorization")String token,
                                                     @PathVariable Long id)
    {
        firebaseAuthService.verifyAdminAndGetEmail(token);
        ArticleDTO article = adminService.getArticleById(id);

        return ResponseEntity.ok(article);
    }
    @GetMapping("/syntaxes/{id}")
    public ResponseEntity<SyntaxDTO> getSyntaxById(@RequestHeader(name = "Authorization")String token,
                                                     @PathVariable Long id)
    {
        firebaseAuthService.verifyAdminAndGetEmail(token);
        SyntaxDTO syntax = adminService.getSyntaxById(id);

        return ResponseEntity.ok(syntax);
    }

    @PutMapping("/articles/{id}")
    public ResponseEntity<?> putArticle(@RequestHeader(name = "Authorization") String token,
                                        @RequestParam(value = "image", required = false) MultipartFile imageFile,
                                         @PathVariable Long id,
                                         @ModelAttribute ArticleRequest request)
    {
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);

        String imageUrl = null;
        // imageFileがnullでなく、かつ空でなければ画像保存
        if (imageFile != null && !imageFile.isEmpty()) {
            // 1. 保存ディレクトリの準備
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                return ResponseEntity.status(500).body("ディレクトリ作成に失敗しました");
            }

            // 2. ファイル名をユニークに生成
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
            File dest = new File(dir, fileName);

            // 3. 保存
            try {
                imageFile.transferTo(dest);
                // 4. 公開URLを組み立て
                imageUrl = "/uploads/" + fileName;
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("画像保存エラー");
            }
        }

        adminService.putArticle(id, request,adminEmail,imageUrl);
        return ResponseEntity.ok("投稿完了");
    }

    @PutMapping("/syntaxes/{id}")
    public ResponseEntity<?> putSyntax(@RequestHeader(name = "Authorization") String token,
                                       @RequestBody SyntaxRequest request,
                                       @PathVariable Long id) {

        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        adminService.putSyntax(id, request, adminEmail);

        return ResponseEntity.ok("更新完了");
    }
    @DeleteMapping("/articles/{id}")
    public ResponseEntity<?> deleteArticle(@RequestHeader(name = "Authorization") String token,
                                           @PathVariable Long id)
    {
        adminService.deleteById(id);
     return ResponseEntity.ok("削除しました。");
    }

    @GetMapping("/procedure")
    public ResponseEntity<Page<ProcedureDTO>> getAllProcedure(@RequestHeader(name = "Authorization") String token,
                                                              @RequestParam int page,
                                                              @RequestParam int size)
    {
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        Pageable pageable = PageRequest.of(page, size);
        Page<ProcedureDTO> procedureDTOS = procedureService.getAllProcedure(adminEmail,pageable);
        return ResponseEntity.ok(procedureDTOS);
    }
    @GetMapping("/procedure/{id}")
    public ProcedureDTO gerProcedureById(@RequestHeader(name = "Authorization") String token,
                                         @PathVariable Long id)
    {
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        return procedureService.findById(adminEmail, id);
    }

    @PutMapping("/procedure/{id}")
    public ResponseEntity<?> postProcedure(
            @RequestHeader(name = "Authorization") String token,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @PathVariable Long id,
            @ModelAttribute ProcedureRequest request
    ) {
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);

        // 画像URLをnullで初期化（デフォは「画像なし」）
        String imageUrl = null;

        // imageFileがnullでなく、かつ空でなければ画像保存
        if (imageFile != null && !imageFile.isEmpty()) {
            // 1. 保存ディレクトリの準備
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                return ResponseEntity.status(500).body("ディレクトリ作成に失敗しました");
            }

            // 2. ファイル名をユニークに生成
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
            File dest = new File(dir, fileName);

            // 3. 保存
            try {
                imageFile.transferTo(dest);
                // 4. 公開URLを組み立て
                imageUrl = "/uploads/" + fileName;
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("画像保存エラー");
            }
        }

        // imageUrlがnullなら画像なし、それ以外は画像ありで保存
        procedureService.putProcedure(adminEmail, id, request, imageUrl);
        return ResponseEntity.ok("投稿完了");
    }

    @PutMapping("/procedure/toggle/{id}")
    public ResponseEntity<?> putToggle(@RequestHeader(name = "Authorization") String token,
                                        @PathVariable Long id)
    {
        firebaseAuthService.verifyAdminAndGetEmail(token);
        procedureService.putToggle(id);
        return ResponseEntity.ok("公開非公開変更");
    }

    @DeleteMapping("/procedure/{id}")
    public ResponseEntity<?> deleteProcedure(@RequestHeader(name = "Authorization") String token,
                                             @PathVariable Long id)
    {

        firebaseAuthService.verifyAdminAndGetEmail(token);
        procedureService.deleteById(id);
        return ResponseEntity.ok("削除完了");
    }

    @DeleteMapping("syntaxes/{id}")
    public ResponseEntity<?> deleteSyntax(@RequestHeader(name = "Authorization") String token,
                                                 @PathVariable Long id)
    {
        firebaseAuthService.verifyAdminAndGetEmail(token);
        adminService.deleteSyntaxById(id);
        return ResponseEntity.ok("削除完了");
    }
}
