package com.example.tech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CalendarActionDTO {
    private LocalDate date;
    private int actions;
    public CalendarActionDTO(java.sql.Date date, Long actions) {
        this.date = date.toLocalDate();
        this.actions = actions.intValue();
    }

}
