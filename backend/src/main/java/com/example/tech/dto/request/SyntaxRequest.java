package com.example.tech.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SyntaxRequest {
    private String slug;
    private String title;
    private String category;
    private String content;
}
