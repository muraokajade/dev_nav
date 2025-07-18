package com.example.tech.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor // これだけ。自分で引数なし作らない！
public class CalendarActionDTO {
    private LocalDate date;
    private int actions;

    // java.sql.Date, Long
    /**
     * Spring Data JPAのHQLの戻り値が java.sql.Date, LocalDate など色々な型になるため、Object受けして吸収する。
     * 他の引数型で増えたらifを追加すること。
     */
    public CalendarActionDTO(Object date, Long actions) {

        if (date instanceof java.sql.Date d) {
            this.date = d.toLocalDate();
        } else if (date instanceof java.time.LocalDate d) {
            this.date = d;
        } else if (date instanceof java.sql.Timestamp t) {
            this.date = t.toLocalDateTime().toLocalDate();
        } else if (date instanceof java.util.Date d) {
            this.date = d.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
        } else {
            throw new IllegalArgumentException("Unsupported date type: " + date.getClass());
        }
        this.actions = actions.intValue();
    }

//    public CalendarActionDTO(LocalDate date, int actions) {
//        this.date = date;
//        this.actions = actions;
//    }
//    public CalendarActionDTO(LocalDate date, int actions) {
//        this.date = date;
//        this.actions = actions;
//    }
//    public CalendarActionDTO(java.util.Date date, Long actions) {
//        this.date = date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
//        this.actions = actions.intValue();
//    }

//    public CalendarActionDTO(Object date, Object actions) {
//        System.out.println("DEBUG: " + date.getClass() + " " + actions.getClass());
//        this.date = null;
//        this.actions = 0;
//    }




}
