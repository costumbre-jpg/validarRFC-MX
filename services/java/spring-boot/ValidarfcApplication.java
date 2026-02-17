package com.validarfc.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@SpringBootApplication
public class ValidarfcApplication {
    public static void main(String[] args) {
        SpringApplication.run(ValidarfcApplication.class, args);
    }
}

@RestController
@RequestMapping("/api")
class ValidationController {
    private static final Pattern RFC_PATTERN = Pattern.compile("^[A-ZÑ&]{3,4}\\d{6}(?:[A-Z0-9]{3})?$");
    
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        return response;
    }
    
    @PostMapping("/validate")
    public Map<String, Object> validate(@RequestBody ValidationRequest request) {
        String rfc = request.getRfc().toUpperCase().trim();
        boolean isValid = RFC_PATTERN.matcher(rfc).matches();
        
        Map<String, Object> response = new HashMap<>();
        response.put("rfc", rfc);
        response.put("is_valid", isValid);
        response.put("created_at", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        
        return response;
    }
}

class ValidationRequest {
    private String rfc;
    
    public String getRfc() {
        return rfc;
    }
    
    public void setRfc(String rfc) {
        this.rfc = rfc;
    }
}
