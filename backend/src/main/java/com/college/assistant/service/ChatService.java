package com.college.assistant.service;

import com.college.assistant.dto.ChatRequest;
import com.college.assistant.dto.ChatResponse;
import com.college.assistant.dto.ChatResponse.SourceInfo;
import com.college.assistant.entity.ChatMessage;
import com.college.assistant.entity.ChatSession;
import com.college.assistant.exception.ResourceNotFoundException;
import com.college.assistant.exception.UnauthorizedException;
import com.college.assistant.repository.ChatMessageRepository;
import com.college.assistant.repository.ChatSessionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
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

    @Autowired
    private IntentClassifierService intentClassifierService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public ChatResponse processChatMessage(ChatRequest request, Long userId) {
        String semester = request.getSemester() != null ? request.getSemester() : "5th Sem";

        // Manage session first so we have access to context history
        String sessionId = request.getSessionId();
        ChatSession session;
        List<ChatMessage> previousMessages = Collections.emptyList();

        if (sessionId == null || sessionId.trim().isEmpty() || !sessionRepository.existsById(sessionId)) {
            sessionId = "sess_" + userId + "_" + UUID.randomUUID().toString().substring(0, 8);
            String title = request.getMessage().length() > 35
                    ? request.getMessage().substring(0, 35) + "..."
                    : request.getMessage();

            session = ChatSession.builder()
                    .id(sessionId)
                    .userId(userId)
                    .title(title)
                    .build();
            sessionRepository.save(session);
        } else {
            session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

            if (!session.getUserId().equals(userId)) {
                throw new UnauthorizedException("You are not authorized to post to this chat session");
            }
            previousMessages = messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
            session.setUpdatedAt(LocalDateTime.now());
            sessionRepository.save(session);
        }

        // 1. Dedicated Intent Classification Layer
        IntentClassifierService.ClassificationResult classification = intentClassifierService.classify(
                request.getMessage(),
                request.getSubject(),
                previousMessages
        );

        // Save student question to conversation history
        ChatMessage userMsg = ChatMessage.builder()
                .sessionId(sessionId)
                .sender("STUDENT")
                .message(request.getMessage())
                .build();
        messageRepository.save(userMsg);

        // If intent has a direct natural conversational or clarification response (e.g. GREETING, GENERAL_CONVERSATION, AMBIGUOUS_QUERY, or topic switch prompt)
        if (classification.getDirectResponse() != null) {
            String directAnswer = classification.getDirectResponse();

            ChatMessage aiMsg = ChatMessage.builder()
                    .sessionId(sessionId)
                    .sender("AI")
                    .message(directAnswer)
                    .sourcesJson(null)
                    .build();
            messageRepository.save(aiMsg);

            return ChatResponse.builder()
                    .sessionId(sessionId)
                    .answer(directAnswer)
                    .sources(Collections.emptyList())
                    .detectedSubject(classification.getSubject())
                    .detectedIntent(classification.getIntent().name())
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        // 2. ACADEMIC_QUESTION or continuation FOLLOW_UP: Use RAG & Gemini AI pipeline
        String effectiveSubject = classification.getSubject();

        // Retrieve relevant chunks via RAG strictly for matching query text and subject
        List<RagEngineService.ScoredChunk> chunks = ragEngineService.retrieveRelevantChunks(
                request.getMessage(), semester, effectiveSubject, 3
        );

        // Generate high quality AI answer using Gemini SDK or multi-subject knowledge synthesis
        String answer = geminiAiService.generateGroundedResponse(
                request.getMessage(), chunks, semester, effectiveSubject
        );

        // Format sources if verified chunks were found
        List<SourceInfo> sourceInfos = chunks.stream()
                .map(RagEngineService.ScoredChunk::toSourceInfo)
                .collect(Collectors.toList());

        String sourcesJson = null;
        try {
            sourcesJson = objectMapper.writeValueAsString(sourceInfos);
        } catch (JsonProcessingException e) {
            System.err.println("Error serializing sources: " + e.getMessage());
        }

        // Save AI response
        ChatMessage aiMsg = ChatMessage.builder()
                .sessionId(sessionId)
                .sender("AI")
                .message(answer)
                .sourcesJson(sourcesJson)
                .build();
        messageRepository.save(aiMsg);

        return ChatResponse.builder()
                .sessionId(sessionId)
                .answer(answer)
                .sources(sourceInfos)
                .detectedSubject(effectiveSubject)
                .detectedIntent(classification.getIntent().name())
                .timestamp(LocalDateTime.now())
                .build();
    }

    public List<ChatSession> getUserSessions(Long userId) {
        return sessionRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public List<ChatMessage> getSessionMessages(String sessionId, Long userId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        if (!session.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have access to view this session");
        }

        return messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
    }

    @Transactional
    public void deleteSession(String sessionId, Long userId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        if (!session.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to delete this session");
        }

        messageRepository.deleteBySessionId(sessionId);
        sessionRepository.delete(session);
    }
}
