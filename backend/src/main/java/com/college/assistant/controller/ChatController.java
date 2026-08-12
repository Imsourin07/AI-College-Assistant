package com.college.assistant.controller;

import com.college.assistant.dto.ChatRequest;
import com.college.assistant.dto.ChatResponse;
import com.college.assistant.entity.ChatMessage;
import com.college.assistant.entity.ChatSession;
import com.college.assistant.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody ChatRequest request) {
        try {
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Question message cannot be empty!"));
            }
            ChatResponse response = chatService.processChatMessage(request, 1L);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Chat processing error: " + e.getMessage()));
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getSessions(@RequestParam(value = "userId", defaultValue = "1") Long userId) {
        List<ChatSession> sessions = chatService.getUserSessions(userId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getSessionMessages(@PathVariable String sessionId) {
        List<ChatMessage> messages = chatService.getSessionMessages(sessionId);
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<?> deleteSession(@PathVariable String sessionId) {
        chatService.deleteSession(sessionId);
        return ResponseEntity.ok(Map.of("message", "Chat session deleted successfully!"));
    }
}
