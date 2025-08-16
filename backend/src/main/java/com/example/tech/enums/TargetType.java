package com.example.tech.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum TargetType {
    ARTICLE,
    SYNTAX,
    PROCEDURE;

    @JsonCreator
    public static TargetType fromString(String key) {
        return key == null ? null : TargetType.valueOf(key.toUpperCase());
    }
}
