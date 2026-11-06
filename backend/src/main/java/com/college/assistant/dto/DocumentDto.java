package com.college.assistant.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDto {
    private Long id;
    private String fileName;
    private String fileType;
    private String semester;
    private String subject;
    private LocalDateTime uploadDate;
    private String uploadedBy;
    private Long userId;
    private Integer chunkCount;
}
