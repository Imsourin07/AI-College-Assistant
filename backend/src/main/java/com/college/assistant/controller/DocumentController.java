package com.college.assistant.controller;

import com.college.assistant.dto.DocumentDto;
import com.college.assistant.entity.Document;
import com.college.assistant.repository.DocumentChunkRepository;
import com.college.assistant.repository.DocumentRepository;
import com.college.assistant.service.PdfIngestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private PdfIngestionService pdfIngestionService;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentChunkRepository chunkRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "semester", defaultValue = "5th Sem") String semester,
            @RequestParam(value = "subject", defaultValue = "Operating Systems") String subject,
            @RequestParam(value = "uploadedBy", required = false) String uploadedBy
    ) {
        try {
            if (file.isEmpty() || !file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Please upload a valid PDF document file!"));
            }

            Document doc = pdfIngestionService.processAndStorePdf(file, semester, subject, uploadedBy);
            return ResponseEntity.ok(Map.of(
                    "message", "PDF Document uploaded and RAG indexed successfully!",
                    "documentId", doc.getId(),
                    "fileName", doc.getFileName()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error parsing PDF: " + e.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<DocumentDto>> listDocuments(
            @RequestParam(value = "semester", required = false) String semester,
            @RequestParam(value = "subject", required = false) String subject
    ) {
        List<Document> docs;
        if (semester != null && subject != null) {
            docs = documentRepository.findBySemesterAndSubject(semester, subject);
        } else if (semester != null) {
            docs = documentRepository.findBySemester(semester);
        } else {
            docs = documentRepository.findAll();
        }

        List<DocumentDto> dtos = docs.stream().map(doc -> DocumentDto.builder()
                .id(doc.getId())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .semester(doc.getSemester())
                .subject(doc.getSubject())
                .uploadDate(doc.getUploadDate())
                .uploadedBy(doc.getUploadedBy())
                .chunkCount(chunkRepository.findByDocumentId(doc.getId()).size())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        try {
            chunkRepository.deleteByDocumentId(id);
            documentRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
