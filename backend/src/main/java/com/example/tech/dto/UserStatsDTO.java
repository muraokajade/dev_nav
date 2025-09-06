package com.example.tech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserStatsDTO {
    private long readCount;
    private long reviewCount;
    private long likeCount;
    private long commentCount;
}
