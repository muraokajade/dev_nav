package com.example.tech.api;

import java.util.List;

public record ThreadWithMessagesDto(ThreadDto thread, List<MessageDto> messages) {}
