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
    
    @Query("SELECT c FROM DocumentChunk c WHERE (:semester IS NULL OR c.semester = :semester) AND (:subject IS NULL OR c.subject = :subject)")
    List<DocumentChunk> findBySemesterAndSubjectFilter(@Param("semester") String semester, @Param("subject") String subject);
    
    void deleteByDocumentId(Long documentId);
}
