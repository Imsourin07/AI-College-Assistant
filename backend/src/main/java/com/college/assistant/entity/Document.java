package com.college.assistant.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type", length = 100)
    private String fileType;

    @Column(nullable = false, length = 50)
    private String semester;

    @Column(nullable = false, length = 100)
    private String subject;

    @Column(name = "upload_date", updatable = false)
    private LocalDateTime uploadDate;

    @Column(name = "uploaded_by", length = 100)
    private String uploadedBy;

    @Column(name = "user_id")
    private Long userId;

    @PrePersist
    protected void onCreate() {
        this.uploadDate = LocalDateTime.now();
    }
}
