package com.college.assistant.service;

import com.college.assistant.dto.ChatResponse.SourceInfo;
import com.college.assistant.entity.DocumentChunk;
import com.college.assistant.repository.DocumentChunkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RagEngineService {

    @Autowired
    private DocumentChunkRepository chunkRepository;

    public List<ScoredChunk> retrieveRelevantChunks(String query, String semester, String subject, int topK) {
        List<DocumentChunk> allChunks;
        
        if (semester != null || subject != null) {
            allChunks = chunkRepository.findBySemesterAndSubjectFilter(semester, subject);
            if (allChunks.isEmpty()) {
                allChunks = chunkRepository.findAll();
            }
        } else {
            allChunks = chunkRepository.findAll();
        }

        if (allChunks.isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedQuery = query.toLowerCase();
        Set<String> queryTokens = extractTokens(normalizedQuery);

        List<ScoredChunk> scoredList = new ArrayList<>();

        for (DocumentChunk chunk : allChunks) {
            String content = chunk.getContent().toLowerCase();
            Set<String> contentTokens = extractTokens(content);

            // Compute TF-IDF style keyword match score
            double matchScore = 0.0;
            for (String qToken : queryTokens) {
                if (content.contains(qToken)) {
                    matchScore += 1.5;
                }
                if (contentTokens.contains(qToken)) {
                    matchScore += 2.0;
                }
            }

            // Bonus for semester & subject query match
            if (semester != null && chunk.getSemester() != null && chunk.getSemester().equalsIgnoreCase(semester)) {
                matchScore += 1.0;
            }
            if (subject != null && chunk.getSubject() != null && chunk.getSubject().equalsIgnoreCase(subject)) {
                matchScore += 1.0;
            }

            if (matchScore > 0) {
                scoredList.add(new ScoredChunk(chunk, matchScore));
            }
        }

        // Sort descending by score
        scoredList.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        return scoredList.stream().limit(topK).collect(Collectors.toList());
    }

    private Set<String> extractTokens(String text) {
        String cleaned = text.replaceAll("[^a-zA-Z0-9অ-ৱা-হ0-9]", " ");
        String[] words = cleaned.split("\\s+");
        Set<String> tokens = new HashSet<>();
        for (String w : words) {
            if (w.length() >= 2) {
                tokens.add(w.toLowerCase());
            }
        }
        return tokens;
    }

    public static class ScoredChunk {
        private final DocumentChunk chunk;
        private final double score;

        public ScoredChunk(DocumentChunk chunk, double score) {
            this.chunk = chunk;
            this.score = score;
        }

        public DocumentChunk getChunk() { return chunk; }
        public double getScore() { return score; }

        public SourceInfo toSourceInfo() {
            String excerpt = chunk.getContent();
            if (excerpt.length() > 180) {
                excerpt = excerpt.substring(0, 180) + "...";
            }
            return new SourceInfo(
                    chunk.getDocumentName() != null ? chunk.getDocumentName() : "College_Syllabus.pdf",
                    chunk.getPageNumber() != null ? chunk.getPageNumber() : 1,
                    excerpt,
                    score
            );
        }
    }
}
