package backend.backend.Service.Impl;

import backend.backend.Service.AiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiServiceImpl implements AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    public AiServiceImpl(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public String generateContent(String prompt) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("YOUR_ACTUAL_API_KEY_HERE")) {
            throw new RuntimeException("Gemini API key is not configured");
        }

        String url = GEMINI_API_URL + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Build the request body
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            String response = restTemplate.postForObject(url, requestEntity, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode contentNode = firstCandidate.path("content");
                JsonNode parts = contentNode.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).path("text").asText();
                }
            }
            return "Failed to parse AI response";
        } catch (HttpStatusCodeException e) {
            String statusText = e.getStatusCode().toString();
            if (statusText.contains("503")) {
                throw new backend.backend.Exceptions.BadRequestException("The AI service is currently experiencing high demand. Please wait a few moments and try again.");
            } else if (statusText.contains("429")) {
                throw new backend.backend.Exceptions.BadRequestException("The AI service quota has been exceeded. Please try again later.");
            }
            throw new backend.backend.Exceptions.BadRequestException("AI service returned an error: " + statusText);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error communicating with AI service: " + e.getMessage());
        }
    }
}
