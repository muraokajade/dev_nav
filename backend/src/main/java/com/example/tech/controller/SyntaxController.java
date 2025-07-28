package com.example.tech.controller;

import com.example.tech.dto.SyntaxDTO;
import com.example.tech.service.SyntaxService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:3000")
@RequiredArgsConstructor
@RequestMapping("/api/syntaxes")
public class SyntaxController {

    private final SyntaxService syntaxService;

    @GetMapping
    public ResponseEntity<Page<SyntaxDTO>> getAllSyntaxes(@RequestParam int page,
                                                          @RequestParam int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SyntaxDTO> syntaxDTOS = syntaxService.getAllArticles(pageable);
        return ResponseEntity.ok(syntaxDTOS);
    }
    @GetMapping("/{id}")
    public ResponseEntity<SyntaxDTO> getSyntaxDetail(@PathVariable Long id)
    {
        SyntaxDTO syntax = syntaxService.findById(id);
        return ResponseEntity.ok(syntax);
    }

}
