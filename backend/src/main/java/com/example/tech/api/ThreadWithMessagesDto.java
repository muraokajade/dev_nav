package com.example.tech.api;

import com.example.tech.domain.ThreadMessageEntity;

import java.util.List;

public record ThreadWithMessagesDto(ThreadDto thread, List<MessageDto> messages) {



}
