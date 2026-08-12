package com.college.assistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeminiAiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateGroundedResponse(String studentQuery, List<RagEngineService.ScoredChunk> retrievedChunks) {
        StringBuilder contextBuilder = new StringBuilder();
        if (retrievedChunks != null && !retrievedChunks.isEmpty()) {
            contextBuilder.append("Uploaded College PDF Document Excerpts:\n");
            for (int i = 0; i < retrievedChunks.size(); i++) {
                RagEngineService.ScoredChunk sc = retrievedChunks.get(i);
                contextBuilder.append(String.format("[%d] Source: %s (Page %d)\nContent: %s\n\n",
                        i + 1,
                        sc.getChunk().getDocumentName(),
                        sc.getChunk().getPageNumber(),
                        sc.getChunk().getContent()));
            }
        } else {
            contextBuilder.append("No specific college document PDF uploaded yet for this query. Using standard university curriculum knowledge.\n");
        }

        String systemInstruction = "You are an intelligent AI College Assistant for university students. " +
                "Answer the student's question clearly, accurately, and professionally. " +
                "You must support queries in Bengali, English, or Banglish (e.g. '5th sem-এর OS syllabus কী?'). " +
                "If college PDF excerpts are provided in context, extract and cite the exact topics, modules, and page numbers. " +
                "Format output neatly using Markdown headings, bullet points, and code snippets where applicable.\n\n" +
                "Context Data:\n" + contextBuilder.toString() + "\n" +
                "Student Question: " + studentQuery;

        if (apiKey != null && !apiKey.equals("DEMO_KEY") && !apiKey.isEmpty()) {
            try {
                String fullUrl = apiUrl + "?key=" + apiKey;
                
                Map<String, Object> textPart = Map.of("text", systemInstruction);
                Map<String, Object> contentObj = Map.of("parts", List.of(textPart));
                Map<String, Object> requestBody = Map.of("contents", List.of(contentObj));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.exchange(fullUrl, HttpMethod.POST, entity, String.class);

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    JsonNode rootNode = objectMapper.readTree(response.getBody());
                    JsonNode textNode = rootNode.path("candidates").get(0).path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        return textNode.asText();
                    }
                }
            } catch (Exception e) {
                System.err.println("Gemini API call failed, using intelligent fallback response: " + e.getMessage());
            }
        }

        // Smart grounded fallback when Gemini API key is in DEMO mode or offline
        return buildSmartFallbackAnswer(studentQuery, retrievedChunks);
    }

    private String buildSmartFallbackAnswer(String query, List<RagEngineService.ScoredChunk> chunks) {
        String lowerQuery = query.toLowerCase();

        if (!chunks.isEmpty()) {
            StringBuilder response = new StringBuilder();
            response.append("### 📚 College PDF Answer (RAG Grounded)\n\n");
            response.append("Here is the relevant information extracted from your uploaded college documents:\n\n");

            for (RagEngineService.ScoredChunk sc : chunks) {
                response.append(String.format("#### 📄 %s (Page %d)\n", sc.getChunk().getDocumentName(), sc.getChunk().getPageNumber()));
                response.append("> ").append(sc.getChunk().getContent().replace("\n", "\n> ")).append("\n\n");
            }
            response.append("\n*Note: Add your Google Gemini API key in `application.properties` for extended generative natural language synthesis.*");
            return response.toString();
        }

        if (lowerQuery.contains("os") || lowerQuery.contains("operating system") || lowerQuery.contains("5th sem")) {
            return "### 🖥️ 5th Semester Operating Systems (OS) Syllabus & Core Modules\n\n" +
                    "**1. Module 1: Introduction & System Structure**\n" +
                    "- OS Components, Services, System Calls & System Programs\n" +
                    "- Kernel Architectures (Monolithic, Microkernel, Hybrid)\n\n" +
                    "**2. Module 2: Process Management & CPU Scheduling**\n" +
                    "- Process States, PCB, Threading Models\n" +
                    "- Scheduling Algorithms: FCFS, SJF, Priority, Round Robin, Multi-level Queue\n\n" +
                    "**3. Module 3: Synchronization & Deadlocks**\n" +
                    "- Critical Section Problem, Mutex, Semaphores, Monitors\n" +
                    "- Deadlock Characterization, Prevention, Avoidance (Banker's Algorithm), Detection & Recovery\n\n" +
                    "**4. Module 4: Memory Management**\n" +
                    "- Contiguous Allocation, Paging, Segmentation\n" +
                    "- Virtual Memory, Demand Paging, Page Replacement Algorithms (FIFO, LRU, Optimal)\n\n" +
                    "**5. Module 5: Storage & File Systems**\n" +
                    "- File Access Methods, Directory Structure, Disk Scheduling Algorithms (FCFS, SSTF, SCAN, C-SCAN)\n\n" +
                    "💡 *Pro Tip: Upload your college OS PDF syllabus notes using the PDF Uploader button above to get exact university specific details!*";
        }

        return "### 🤖 AI College Assistant Response\n\n" +
                "I have received your query: **\"" + query + "\"**.\n\n" +
                "To get exact syllabus, lecture notes, or exam solutions for your specific course:\n" +
                "1. Click **Upload PDF Notes** at the top bar.\n" +
                "2. Upload your college syllabus/note PDF file tagged with your Semester & Subject.\n" +
                "3. Ask any detailed question in **Bengali**, **English**, or **Banglish**!";
    }
}
