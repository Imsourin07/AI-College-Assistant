package com.college.assistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String sessionId;
    private String answer;
    private List<SourceInfo> sources;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SourceInfo {
        private String fileName;
        private Integer pageNumber;
        private String excerpt;
        private Double relevanceScore;
    }
}
