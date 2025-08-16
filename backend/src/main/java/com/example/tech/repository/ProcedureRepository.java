package com.example.tech.repository;

import com.example.tech.projection.ContentBrief;
import com.example.tech.entity.ProcedureEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProcedureRepository extends JpaRepository<ProcedureEntity, Long> {

    @Query("""
      select p.id as id, p.title as title, p.slug as slug
      from ProcedureEntity p
      where p.id in :ids
    """)
    List<ContentBrief> findBriefsByIdIn(@Param("ids") Collection<Long> ids);
}
