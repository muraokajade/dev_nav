package com.example.tech.repository;

import com.example.tech.entity.ProcedureEntity;
import com.sun.jdi.LongValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcedureRepository extends JpaRepository<ProcedureEntity, Long> {
}
