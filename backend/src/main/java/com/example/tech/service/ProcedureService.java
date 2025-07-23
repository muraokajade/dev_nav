package com.example.tech.service;

import com.example.tech.dto.ProcedureDTO;
import com.example.tech.dto.request.ProcedureRequest;
import com.example.tech.entity.ProcedureEntity;
import com.example.tech.entity.UserEntity;
import com.example.tech.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProcedureService {
    private final AdminRepository adminRepository;
    private final SyntaxRepository syntaxRepository;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final ProcedureRepository procedureRepository;

    public void postProcedure(String adminEmail, ProcedureRequest request, String imageUrl) {
        UserEntity user = userRepository.findUserByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("管理者が見つかりません。"));

        ProcedureEntity entity = new ProcedureEntity();
        entity.setStepNumber(request.getStepNumber());
        entity.setSlug(request.getSlug());
        entity.setTitle(request.getTitle());
        entity.setUser(user);
        entity.setUserEmail(adminEmail);
        entity.setAuthorName(user.getDisplayName());
        entity.setCategory(request.getCategory());
        entity.setContent(request.getContent());
        entity.setImageUrl(imageUrl);
        entity.setPublished(true);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());


        procedureRepository.save(entity);

    }

    public Page<ProcedureDTO> getAllProcedure(String adminEmail, Pageable pageable) {
        Page<ProcedureEntity> entities = procedureRepository.findAll(pageable);
        return entities.map(this::convertToProcedureDTO);
    }

    private ProcedureDTO convertToProcedureDTO(ProcedureEntity entity)
    {
        ProcedureDTO dto = new ProcedureDTO();
        dto.setId(entity.getId());
        dto.setStepNumber(entity.getStepNumber());
        dto.setSlug(entity.getSlug());
        dto.setTitle(entity.getTitle());
        dto.setUserEmail(entity.getUser().getEmail());
        dto.setAuthorName(entity.getAuthorName());
        dto.setCategory(entity.getCategory());
        dto.setContent(entity.getContent());
        dto.setImageUrl(entity.getImageUrl());
        dto.setPublished(entity.isPublished());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public ProcedureDTO findById(String adminEmail, Long id) {
        ProcedureEntity entity = procedureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("記事が見つかりません"));
        return convertToProcedureDTO(entity);
    }

    public void putProcedure(String adminEmail, Long id, ProcedureRequest request, String imageUrl) {
        ProcedureEntity entity = procedureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

        UserEntity editor = userRepository.findUserByEmail(adminEmail)
                        .orElseThrow(() -> new RuntimeException("ユーザーが見つかりません。"));
        entity.setStepNumber(request.getStepNumber());
        entity.setSlug(request.getSlug());
        entity.setTitle(request.getTitle());
        entity.setCategory(request.getCategory());
        entity.setContent(request.getContent());
        entity.setLastEditorEmail(editor.getEmail());
        entity.setLastEditorName(editor.getDisplayName());
        entity.setImageUrl(imageUrl);
        entity.setPublished(true);
        entity.setUpdatedAt(LocalDateTime.now());

        procedureRepository.save(entity);


    }

    public void putToggle(Long id) {
        ProcedureEntity entity = procedureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

        entity.setPublished(!entity.isPublished());

        procedureRepository.save(entity);
    }

    public Page<ProcedureDTO> findAllProcedures(Pageable pageable) {
        Page<ProcedureEntity> entities = procedureRepository.findAll(pageable);
        return entities.map(this::convertToProcedureDTO);
    }

    public ProcedureDTO getProcedureById(Long id) {
        ProcedureEntity entity = procedureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("記事が見つかりません"));

        return convertToProcedureDTO(entity);
    }

    public void deleteById(Long id) {
        ProcedureEntity entity = procedureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("記事が見つかりません。"));

        procedureRepository.delete(entity);
    }
}