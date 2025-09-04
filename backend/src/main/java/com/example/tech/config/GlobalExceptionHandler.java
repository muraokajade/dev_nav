// src/main/java/com/example/tech/config/GlobalExceptionHandler.java
package com.example.tech.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDup(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("conflict");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBad(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body("bad request");
    }
}
