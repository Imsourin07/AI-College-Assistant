package com.college.assistant.repository;

import com.college.assistant.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findBySemester(String semester);
    List<Document> findBySemesterAndSubject(String semester, String subject);
    List<Document> findByUserId(Long userId);
    List<Document> findByUserIdAndSemesterAndSubject(Long userId, String semester, String subject);
}
