package com.example.tech.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class BootDiagnostics {

    @Value("${spring.profiles.active:default}")
    String profile;

    @Value("${spring.datasource.url:unknown}")
    String url;

    @EventListener(ApplicationReadyEvent.class)
    public void log() {
        System.out.println("[DIAG] profile=" + profile);
        System.out.println("[DIAG] datasource.url=" + url);
    }
}
