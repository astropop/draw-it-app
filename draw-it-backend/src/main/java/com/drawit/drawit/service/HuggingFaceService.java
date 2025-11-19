package com.drawit.drawit.service;

import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.web.reactive.function.client.WebClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class HuggingFaceService {

    @Value("${huggingface.api.url}")
    private String apiUrl;

    @Value("${huggingface.api.token}")
    private String apiToken;


    private final WebClient.Builder webClientBuilder;


//    private final RestTemplate restTemplate = new RestTemplate();
//    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<String> generateWords(String theme, String language) {
        try {

            String model = "openai/gpt-oss-20b";
            String prompt = String.format(
                    "Generate 5 simple %s words related to '%s'. Only return the words separated by commas, nothing else.",
                    language, theme
            );


//            HttpHeaders headers = new HttpHeaders();
//            headers.set("Authorization", "Bearer " + apiToken);
//            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of(
//                    "model", model,
                    "content", prompt,
                    "parameters", Map.of(
//                            "max_length", 50,
                            "max_tokens", 100,
                            "token", "hf_token",
                            "temperature", 0.7,
                            "provider", "together"
                    )
            );

//            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            WebClient webClient = webClientBuilder
                    .baseUrl(apiUrl)
                    .defaultHeaders(httpHeaders -> {
                        httpHeaders.put("Authorization", Collections.singletonList("Bearer " + apiToken));
                        httpHeaders.put(HttpHeaders.CONTENT_TYPE, Collections.singletonList(MediaType.APPLICATION_JSON_VALUE));
                    })
                    .build();

            String response = webClient.post()
                    .uri("/" + model)
                    .bodyValue(requestBody)
//                    .header()
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

//            ResponseEntity<String> response = restTemplate.exchange(
//                    apiUrl + "/" + model,
//                    HttpMethod.POST,
//                    entity,
//                    String.class
//            );

//            JsonNode jsonResponse = objectMapper.readTree(response.getBody());

//            String generatedText = jsonResponse.get(0).get("generated_text").asString();
            // Parse response and extract words
            // This is simplified - you'll need to parse the actual HuggingFace response
            return parseWords(response, prompt);

        } catch (Exception e) {
            log.error("Failed to generate words from HuggingFace", e);
            // Fallback to default words
            return getDefaultWords(theme);
        }
    }

    /**
     * return 5 parsed words
     *
     * @param response
     * @param prompt
     * @return
     */
    private List<String> parseWords(String response, String prompt) {
        // Implement parsing logic based on HuggingFace response format

        if (response == null) {
            return List.of("word1", "word2", "word3", "word4", "word5");
        }

        String[] words = response
                .replace(prompt, "") // remove requested text
                .trim()
                .split("[,\\n]");

        List<String> result = new ArrayList<>();
        for (String word : words) {
            String cleaned = word.trim().replaceAll("[^\\p{L}\\s]", "");
            if (!cleaned.isEmpty() && result.size() < 5) {
                result.add(cleaned);
            }
        }

        return result;
    }

    private List<String> getDefaultWords(String theme) {
        // Default word lists based on theme
        return switch (theme.toLowerCase()) {
            case "animals" -> Arrays.asList("cat", "dog", "elephant", "lion", "tiger");
            case "food" -> Arrays.asList("pizza", "burger", "sushi", "pasta", "salad");
            case "sports" -> Arrays.asList("soccer", "basketball", "tennis", "volleyball", "baseball");
            default -> Arrays.asList("house", "tree", "car", "phone", "book");
        };
    }
}
