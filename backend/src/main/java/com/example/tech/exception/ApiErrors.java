package com.example.tech.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String,Object>> all(Exception e){
        e.printStackTrace(); // ログにも出す
        return ResponseEntity.status(500).body(Map.of(
                "error", e.getClass().getSimpleName(),
                "message", String.valueOf(e.getMessage())
        ));
    }
}

