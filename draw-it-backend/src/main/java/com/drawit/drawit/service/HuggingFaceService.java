package com.drawit.drawit.service;

import com.drawit.drawit.entity.WordCache;
import com.drawit.drawit.repository.WordCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class HuggingFaceService {

    @Value("${huggingface.api.url}")
    private String apiUrl;

    @Value("${huggingface.api.token}")
    private String apiToken;

    @Autowired
    private WordCacheRepository wordCacheRepository;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * generate and store into cache, calls AI when theme is new
     * @param theme
     * @param needCount
     * @return
     */
    public List<String> getOrCreateKeywords(String theme, int needCount) {

        // 1. Try Word cache table
        Optional<WordCache> cacheOpt = wordCacheRepository.findByThemeIgnoreCase(theme.toLowerCase());
        if (cacheOpt.isPresent()) {
            List<String> allWords = cacheOpt.get().getWords();
            // if list size is bigger than count, return word in cache
            if (allWords.size() >= needCount) {
                Collections.shuffle(allWords);
                return allWords.subList(0, needCount);
            }
        }


        // 2. If not enough in cache, call AI and update cache
        List<String> newWords = generateKeywordsFromAI(theme, needCount);
        WordCache cache = new WordCache();
        cache.setTheme(theme);
        cache.setWords(newWords);
        wordCacheRepository.save(cache);
        log.info("Saved new cache for theme: {}", theme);

        return newWords;
    }

    private List<String> generateKeywordsFromAI(String theme, int count) {
        if (apiToken == null || apiToken.isEmpty()) return List.of();

        String model = "openai/gpt-oss-20b";


        String prompt = String.format(
                "Generate %d simple English words about '%s'. Only the words, comma separated, nothing else.",
                Math.max(count + 2, 7), theme);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "stream", false,
                "messages", List.of(Map.of(
                                "role", "user",
                                "content", prompt
                        )
                )
        );

        String jsonBody = objectMapper.writeValueAsString(requestBody);
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Authorization", "Bearer " + apiToken)
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(12)) // Set timeout per request
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            return parseWords2(response.body());

        } catch (Exception e) {
            log.warn("HuggingFace API fail/timeout: {}", e.getMessage());
        }
        return List.of();
    }

    /**
     * return parsed words
     *
     * @param response
     * @return
     */
    private List<String> parseWords2(String response) {
        // Implement parsing logic based on HuggingFace response format

        if (response == null) {
            return List.of("word1", "word2", "word3", "word4", "word5");
        }

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response);

        String content = root
                .path("choices")
                .get(0)
                .path("message")
                .path("content").asString();

        String[] words = content.trim()
                .split("[,\\n]");


        List<String> result = new ArrayList<>();
        for (String word : words) {
            String cleaned = word.trim().replaceAll("[^\\p{L}\\s]", "");
            if (!cleaned.isEmpty()) {
                result.add(cleaned);
            }
        }

        return result;
    }
}
