package com.example.tech.controller;

import com.example.tech.dto.MessageResponseDTO;
import com.example.tech.dto.request.AnswerRequest;
import com.example.tech.dto.request.MessageRequest;
import com.example.tech.service.FirebaseAuthService;
import com.example.tech.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService messageService;
    private final FirebaseAuthService firebaseAuthService;

    @PostMapping("/add")
    public ResponseEntity<?> addMessage(@RequestHeader(name = "Authorization") String token,
                                        @RequestBody MessageRequest request)
    {
        String userEmail = firebaseAuthService.verifyAndGetEmail(token);
        messageService.postMessage(userEmail,request);
        return ResponseEntity.ok("送信完了");
    }

    @GetMapping
    public ResponseEntity<List<MessageResponseDTO>> getMessage(@RequestParam Long articleId)
    {
        List<MessageResponseDTO> messages = messageService.getMessageByArticleId(articleId);

        return ResponseEntity.ok(messages);

    }
    @GetMapping("/admin/questions")
    public ResponseEntity<List<MessageResponseDTO>> getAllMessages(@RequestHeader(name = "Authorization") String token,
                                                                   @RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "10")int size)
    {
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        Pageable pageable = PageRequest.of(page,size);
        List<MessageResponseDTO> messages = messageService.getAllMessages(adminEmail, pageable);
        return ResponseEntity.ok(messages);
    }
    @PostMapping("admin/questions/{id}/answer")
    public ResponseEntity<?> postMessage(@RequestHeader(name = "Authorization") String token,
                                         @PathVariable Long id,
                                         @RequestBody AnswerRequest request)
    {
        String adminEmail = firebaseAuthService.verifyAdminAndGetEmail(token);
        messageService.answerMessage(id,adminEmail, request);

        return ResponseEntity.ok("返答完了");
    }


}
