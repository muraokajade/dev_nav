package com.example.tech.converter;

import com.example.tech.enums.TargetType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TargetTypeConverter implements AttributeConverter<TargetType, String> {

    @Override
    public String convertToDatabaseColumn(TargetType type) {
        if (type == null) return null;
        return type.name().toLowerCase(); // DBには小文字で保存
    }

    @Override
    public TargetType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return TargetType.valueOf(dbData.toUpperCase()); // 小文字→大文字でEnum変換
    }
}
