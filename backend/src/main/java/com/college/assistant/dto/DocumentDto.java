package com.college.assistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    private Long id;
    private String fileName;
    private String fileType;
    private String semester;
    private String subject;
    private LocalDateTime uploadDate;
    private String uploadedBy;
    private Integer chunkCount;
}
