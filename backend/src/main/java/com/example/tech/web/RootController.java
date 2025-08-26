// backend/src/main/java/com/example/tech/web/RootController.java
package com.example.tech.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.Instant;
import java.util.Map;

@RestController
public class RootController {
    @GetMapping("/") public Map<String,Object> root(){
        return Map.of("status","ok","service","tech","time", Instant.now().toString());
    }
    @GetMapping("/api/ping") public Map<String,String> ping(){ return Map.of("pong","ok"); }
}
