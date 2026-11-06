package com.college.assistant.repository;

import com.college.assistant.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {
    List<DocumentChunk> findByDocumentId(Long documentId);
    void deleteByDocumentId(Long documentId);

    @Query("SELECT dc FROM DocumentChunk dc WHERE (:semester IS NULL OR LOWER(dc.semester) = LOWER(:semester)) AND (:subject IS NULL OR LOWER(dc.subject) = LOWER(:subject))")
    List<DocumentChunk> findBySemesterAndSubjectFilter(@Param("semester") String semester, @Param("subject") String subject);
}
