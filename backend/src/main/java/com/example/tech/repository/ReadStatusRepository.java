package com.example.tech.repository;

import com.example.tech.entity.ReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReadStatusRepository extends JpaRepository<ReadStatus, Long> {
    @Query("select r.contentId from ReadStatus r where r.userId=:userId and r.target=:target")
    List<Long> findContentIdsByUserAndTarget(@Param("userId") Long userId, @Param("target") ReadStatus.Target target);
    boolean existsByUserIdAndTargetAndContentId(Long userId, ReadStatus.Target target, Long contentId);
    void deleteByUserIdAndTargetAndContentId(Long userId, ReadStatus.Target target, Long contentId);
}
