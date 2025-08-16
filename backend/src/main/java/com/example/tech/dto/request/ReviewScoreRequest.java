package com.example.tech.dto.request;

import com.example.tech.enums.TargetType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewScoreRequest {
    private TargetType targetType; // ARTICLE, SYNTAX, PROCEDURE
    private Long refId;            // articleId or syntaxId or procedureId
    private double score;
}
