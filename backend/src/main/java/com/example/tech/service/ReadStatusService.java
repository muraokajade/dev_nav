package com.example.tech.service;

import com.example.tech.entity.ReadStatus;
import com.example.tech.repository.ReadStatusRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReadStatusService {
    private final ReadStatusRepository repo;

    public List<Long> getAll(Long userId, ReadStatus.Target t)
    { return repo.findContentIdsByUserAndTarget(userId,t); }

    public void mark(Long userId, ReadStatus.Target t, Long contentId){
        if(!repo.existsByUserIdAndTargetAndContentId(userId,t,contentId)){
            ReadStatus rs=new ReadStatus(); rs.setUserId(userId); rs.setTarget(t); rs.setContentId(contentId); repo.save(rs);
        }
    }
    public boolean isRead(Long userId, ReadStatus.Target t, Long contentId){
        return repo.existsByUserIdAndTargetAndContentId(userId, t, contentId);
    }
    // Service/Repo 追加
    @Transactional
    public void unmark(Long userId, ReadStatus.Target t, Long contentId){
        repo.deleteByUserIdAndTargetAndContentId(userId, t, contentId);
    }
    // repository




}

