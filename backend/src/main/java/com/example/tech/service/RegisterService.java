package com.example.tech.service;

import com.example.tech.dto.request.RegisterRequest;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.RegisterRepository;
import com.example.tech.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class RegisterService {
    private final RegisterRepository registerRepository;
    private final UserRepository userRepository;

    public void registUser(RegisterRequest request) {
        // 1. すでに同じメールがあればエラー
        if(userRepository.findUserByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("このメールアドレスは既に登録されています。");
        }

        // 2. 新しいエンティティを作って保存
        UserEntity newUser = new UserEntity();
        newUser.setEmail(request.getEmail());
        newUser.setDisplayName(request.getDisplayName());
        newUser.setCreatedAt(LocalDateTime.now());
        userRepository.save(newUser);
    }
}
