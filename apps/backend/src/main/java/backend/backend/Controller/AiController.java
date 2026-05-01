package backend.backend.Controller;

import backend.backend.Dto.Request.AiPromptRequest;
import backend.backend.Service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AiController {

    private final AiService aiService;

    @Autowired
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate-course")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Map<String, String>> generateCourse(@RequestBody AiPromptRequest request) {
        String basePrompt = "You are an expert curriculum designer. Based on the following topic/prompt, generate a suggested course outline. " +
                "Please return the response as a valid JSON object with the following structure (do not include markdown blocks like ```json):\n" +
                "{\n" +
                "  \"title\": \"A catchy title for the course\",\n" +
                "  \"description\": \"A 2-3 sentence overview of the course\",\n" +
                "  \"chapters\": [\n" +
                "    { \"title\": \"Chapter 1: Intro\", \"description\": \"What this covers\" },\n" +
                "    { \"title\": \"Chapter 2: Deep Dive\", \"description\": \"What this covers\" }\n" +
                "  ],\n" +
                "  \"suggestedWeightages\": {\n" +
                "    \"attendance\": 10,\n" +
                "    \"tests\": 40,\n" +
                "    \"liveTests\": 20,\n" +
                "    \"project\": 30\n" +
                "  }\n" +
                "}\n\n" +
                "Topic/Prompt: " + request.getPrompt();

        String response = aiService.generateContent(basePrompt);
        Map<String, String> result = new HashMap<>();
        result.put("result", response);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/generate-quiz")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Map<String, String>> generateQuiz(@RequestBody AiPromptRequest request) {
        String basePrompt = "You are an expert educator. Based on the following chapter text/context, generate multiple choice questions. If the user specifies an amount in the topic/prompt, generate that many questions, otherwise generate 5. " +
                "Please return the response as a valid JSON object containing an array of questions (do not include markdown blocks like ```json):\n" +
                "[\n" +
                "  {\n" +
                "    \"questionText\": \"What is...\",\n" +
                "    \"options\": [\"A\", \"B\", \"C\", \"D\"],\n" +
                "    \"correctAnswerIndex\": 0\n" +
                "  }\n" +
                "]\n\n" +
                "Context: " + request.getContext() + "\n" +
                "Topic: " + request.getPrompt();

        String response = aiService.generateContent(basePrompt);
        Map<String, String> result = new HashMap<>();
        result.put("result", response);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/summarize-project")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Map<String, String>> summarizeProject(@RequestBody AiPromptRequest request) {
        String basePrompt = "You are an AI teaching assistant. Based on the following GitHub activity and project data, please provide a brief summary of the group's progress. " +
                "Highlight who has done the best work, what the current blockers might be, and suggest what the group should focus on next.\n\n" +
                "Data Context:\n" + request.getContext();

        String response = aiService.generateContent(basePrompt);
        Map<String, String> result = new HashMap<>();
        result.put("result", response);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/analyze-performance")
    @PreAuthorize("hasAnyRole('UNI_ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<Map<String, String>> analyzePerformance(@RequestBody AiPromptRequest request) {
        String basePrompt = "You are an AI data analyst for an educational platform. Analyze the following student performance data and provide a concise report. " +
                "Highlight trends, anomalies (like sections performing unusually poorly), and identify top-performing students. Provide actionable advice for the instructor or admin.\n\n" +
                "Data Context:\n" + request.getContext();

        String response = aiService.generateContent(basePrompt);
        Map<String, String> result = new HashMap<>();
        result.put("result", response);
        return ResponseEntity.ok(result);
    }
}
