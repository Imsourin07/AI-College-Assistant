package com.college.assistant.service;

import com.college.assistant.dto.ChatRequest;
import com.college.assistant.dto.ChatResponse;
import com.college.assistant.dto.ChatResponse.SourceInfo;
import com.college.assistant.entity.ChatMessage;
import com.college.assistant.entity.ChatSession;
import com.college.assistant.repository.ChatMessageRepository;
import com.college.assistant.repository.ChatSessionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatSessionRepository sessionRepository;

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private RagEngineService ragEngineService;

    @Autowired
    private GeminiAiService geminiAiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public ChatResponse processChatMessage(ChatRequest request, Long userId) {
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.trim().isEmpty()) {
            sessionId = UUID.randomUUID().toString();
        }

        // Ensure session exists in DB
        String sessionTitle = request.getMessage();
        if (sessionTitle.length() > 40) {
            sessionTitle = sessionTitle.substring(0, 40) + "...";
        }

        Optional<ChatSession> existingSession = sessionRepository.findById(sessionId);
        if (existingSession.isEmpty()) {
            ChatSession session = ChatSession.builder()
                    .id(sessionId)
                    .userId(userId != null ? userId : 1L)
                    .title(sessionTitle)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            sessionRepository.save(session);
        }

        // Save Student Message
        ChatMessage studentMsg = ChatMessage.builder()
                .sessionId(sessionId)
                .sender("STUDENT")
                .message(request.getMessage())
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(studentMsg);

        // Perform RAG Retrieval from PDF Chunks
        List<RagEngineService.ScoredChunk> relevantChunks = ragEngineService.retrieveRelevantChunks(
                request.getMessage(), request.getSemester(), request.getSubject(), 4);

        // Generate AI Answer grounded in PDF context
        String aiAnswer = geminiAiService.generateGroundedResponse(request.getMessage(), relevantChunks);

        List<SourceInfo> sources = relevantChunks.stream()
                .map(RagEngineService.ScoredChunk::toSourceInfo)
                .collect(Collectors.toList());

        String sourcesJson = "";
        try {
            sourcesJson = objectMapper.writeValueAsString(sources);
        } catch (Exception e) {
            sourcesJson = "[]";
        }

        // Save AI Response to DB
        ChatMessage aiMsg = ChatMessage.builder()
                .sessionId(sessionId)
                .sender("AI")
                .message(aiAnswer)
                .sourcesJson(sourcesJson)
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(aiMsg);

        return ChatResponse.builder()
                .sessionId(sessionId)
                .answer(aiAnswer)
                .sources(sources)
                .build();
    }

    public List<ChatSession> getUserSessions(Long userId) {
        return sessionRepository.findByUserIdOrderByUpdatedAtDesc(userId != null ? userId : 1L);
    }

    public List<ChatMessage> getSessionMessages(String sessionId) {
        return messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }

    @Transactional
    public void deleteSession(String sessionId) {
        messageRepository.deleteBySessionId(sessionId);
        sessionRepository.deleteById(sessionId);
    }
}
