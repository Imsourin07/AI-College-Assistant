package com.college.assistant.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private String sessionId;
    private String answer;
    private List<SourceInfo> sources;
    private LocalDateTime timestamp;
    private String detectedSubject;
    private String detectedIntent;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SourceInfo {
        private String fileName;
        private Integer pageNumber;
        private String excerpt;
        private Double score;

        public SourceInfo(String fileName, Integer pageNumber, String excerpt, Double score) {
            this.fileName = fileName;
            this.pageNumber = pageNumber;
            this.excerpt = excerpt;
            this.score = score;
        }

        public SourceInfo(String fileName, Integer pageNumber, String excerpt, double score) {
            this.fileName = fileName;
            this.pageNumber = pageNumber;
            this.excerpt = excerpt;
            this.score = score;
        }
    }
}
