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

        if (queryTokens.isEmpty()) {
            return Collections.emptyList();
        }

        List<ScoredChunk> scoredList = new ArrayList<>();

        for (DocumentChunk chunk : allChunks) {
            // Subject boundary check: if subject is specified and chunk has a defined different subject, skip it
            if (subject != null && !subject.equalsIgnoreCase("General") && chunk.getSubject() != null) {
                if (!chunk.getSubject().equalsIgnoreCase(subject) && !chunk.getSubject().equalsIgnoreCase("General")) {
                    continue;
                }
            }

            String content = chunk.getContent().toLowerCase();
            Set<String> contentTokens = extractTokens(content);

            double textScore = 0.0;
            for (String qToken : queryTokens) {
                if (content.contains(qToken)) {
                    textScore += 1.5;
                }
                if (contentTokens.contains(qToken)) {
                    textScore += 2.0;
                }
            }

            // CRITICAL FIX: If the document text has zero match with student's non-stopword query tokens,
            // NEVER return it as a hit just because semester or subject metadata matched.
            if (textScore <= 0.0) {
                continue;
            }

            double totalScore = textScore;
            if (semester != null && chunk.getSemester() != null && chunk.getSemester().equalsIgnoreCase(semester)) {
                totalScore += 0.5;
            }
            if (subject != null && chunk.getSubject() != null && chunk.getSubject().equalsIgnoreCase(subject)) {
                totalScore += 1.0;
            }

            scoredList.add(new ScoredChunk(chunk, totalScore));
        }

        scoredList.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        return scoredList.stream().limit(topK).collect(Collectors.toList());
    }

    private static final Set<String> STOPWORDS = Set.of(
            "what", "is", "the", "a", "an", "in", "of", "to", "for", "and", "or",
            "how", "why", "can", "you", "tell", "me", "explain", "about", "with",
            "at", "by", "from", "up", "down", "on", "off", "over", "under", "again",
            "further", "then", "once", "here", "there", "when", "where", "all", "any",
            "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor",
            "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can",
            "will", "just", "don", "should", "now"
    );

    private Set<String> extractTokens(String text) {
        // Bengali Unicode range: \u0980-\u09FF plus alphanumeric
        String cleaned = text.replaceAll("[^a-zA-Z0-9\\u0980-\\u09FF]", " ");
        String[] words = cleaned.split("\\s+");
        Set<String> tokens = new HashSet<>();
        for (String w : words) {
            String lower = w.toLowerCase().trim();
            if (lower.length() >= 3 && !STOPWORDS.contains(lower)) {
                tokens.add(lower);
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
            return SourceInfo.builder()
                    .fileName(chunk.getDocumentName() != null ? chunk.getDocumentName() : "College_Document.pdf")
                    .pageNumber(chunk.getPageNumber() != null ? chunk.getPageNumber() : 1)
                    .excerpt(excerpt)
                    .score(score)
                    .build();
        }
    }
}
