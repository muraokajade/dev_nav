package com.example.tech.dto.response;

import com.example.tech.dto.MessageResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessagePageResponse {
    private List<MessageResponseDTO> content;
    private int totalPages;
    private long totalElements;
    private int page;
    private int size;
}
