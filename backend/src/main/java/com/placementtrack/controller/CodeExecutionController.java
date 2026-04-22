package com.placementtrack.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/public/code")

public class CodeExecutionController {

    @PostMapping("/run")
    public ResponseEntity<?> runCode(@RequestBody Map<String, Object> body) {
        try {
            String language = body.get("language").toString();
            String code = body.get("code").toString();
            String stdin = body.getOrDefault("stdin", "").toString();

            // Piston API language mapping
            Map<String, String> langMap = Map.of(
                    "java", "java",
                    "python", "python",
                    "cpp", "c++",
                    "javascript", "javascript"
            );

            Map<String, String> versionMap = Map.of(
                    "java", "15.0.2",
                    "python", "3.10.0",
                    "cpp", "10.2.0",
                    "javascript", "18.15.0"
            );

            String pistonLang = langMap.getOrDefault(language, "python");
            String version = versionMap.getOrDefault(language, "3.10.0");

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> file = new HashMap<>();
            file.put("name", "solution");
            file.put("content", code);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("language", pistonLang);
            requestBody.put("version", version);
            requestBody.put("files", List.of(file));
            requestBody.put("stdin", stdin);

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://emkc.org/api/v2/piston/execute",
                    request, Map.class
            );

            Map<String, Object> result = response.getBody();
            String output = "";

            if (result != null && result.containsKey("run")) {
                Map<String, Object> run = (Map<String, Object>) result.get("run");
                String stdout = run.getOrDefault("stdout", "").toString();
                String stderr = run.getOrDefault("stderr", "").toString();
                if (!stdout.isEmpty()) output = stdout.trim();
                else if (!stderr.isEmpty()) output = "❌ Error:\n" + stderr.trim();
                else output = "No output";
            }

            return ResponseEntity.ok(Map.of("output", output));

        } catch (Exception e) {
            return ResponseEntity.ok(
                    Map.of("output", "❌ Failed: " + e.getMessage())
            );
        }
    }
}