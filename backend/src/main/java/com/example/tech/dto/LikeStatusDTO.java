package com.example.tech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LikeStatusDTO {
    private boolean liked; // ユーザーが「いいね」しているか
    private long count;    // 総いいね数
}
