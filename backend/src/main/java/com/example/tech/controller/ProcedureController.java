package com.example.tech.controller;

import com.example.tech.dto.ProcedureDTO;
import com.example.tech.service.ProcedureService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/api/procedures")
public class ProcedureController {

    private final ProcedureService procedureService;

    @GetMapping
    public ResponseEntity<Page<ProcedureDTO>> getAllProcedures(@RequestParam int page,
                                                               @RequestParam int size)

    {
        Pageable pageable = PageRequest.of(page,size);
        return ResponseEntity.ok(procedureService.findAllProcedures(pageable));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProcedureDTO> getProcedureById(@PathVariable Long id)
    {
        ProcedureDTO procedure = procedureService.getProcedureById(id);
        return ResponseEntity.ok(procedure);
    }


}
