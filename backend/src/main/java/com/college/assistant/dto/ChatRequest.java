package com.college.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {
    private String sessionId;

    @NotBlank(message = "Message cannot be empty")
    private String message;

    private String semester;
    private String subject;
}
