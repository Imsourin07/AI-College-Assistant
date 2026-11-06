package com.college.assistant.controller;

import com.college.assistant.dto.ChatRequest;
import com.college.assistant.dto.ChatResponse;
import com.college.assistant.entity.ChatMessage;
import com.college.assistant.entity.ChatSession;
import com.college.assistant.entity.User;
import com.college.assistant.exception.UnauthorizedException;
import com.college.assistant.repository.UserRepository;
import com.college.assistant.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException("Authentication is required to perform this action");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found in database"));
    }

    @PostMapping("/send")
    public ResponseEntity<ChatResponse> sendMessage(@Valid @RequestBody ChatRequest request) {
        User user = getAuthenticatedUser();
        // Dynamic authenticated user identification - eliminates hardcoded user IDs
        ChatResponse response = chatService.processChatMessage(request, user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getSessions() {
        User user = getAuthenticatedUser();
        List<ChatSession> sessions = chatService.getUserSessions(user.getId());
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getSessionMessages(@PathVariable String sessionId) {
        User user = getAuthenticatedUser();
        List<ChatMessage> messages = chatService.getSessionMessages(sessionId, user.getId());
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Map<String, String>> deleteSession(@PathVariable String sessionId) {
        User user = getAuthenticatedUser();
        chatService.deleteSession(sessionId, user.getId());
        return ResponseEntity.ok(Map.of("message", "Chat session deleted successfully!"));
    }
}
