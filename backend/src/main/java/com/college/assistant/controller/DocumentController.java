package com.college.assistant.controller;

import com.college.assistant.dto.DocumentDto;
import com.college.assistant.entity.Document;
import com.college.assistant.entity.User;
import com.college.assistant.exception.ResourceNotFoundException;
import com.college.assistant.exception.UnauthorizedException;
import com.college.assistant.repository.DocumentChunkRepository;
import com.college.assistant.repository.DocumentRepository;
import com.college.assistant.repository.UserRepository;
import com.college.assistant.service.PdfIngestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private DocumentDto toDto(Document doc) {
        return DocumentDto.builder()
                .id(doc.getId())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .semester(doc.getSemester())
                .subject(doc.getSubject())
                .uploadDate(doc.getUploadDate())
                .uploadedBy(doc.getUploadedBy())
                .userId(doc.getUserId())
                .chunkCount(chunkRepository.findByDocumentId(doc.getId()).size())
                .build();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "semester", defaultValue = "5th Sem") String semester,
            @RequestParam(value = "subject", defaultValue = "Operating Systems") String subject,
            @RequestParam(value = "uploadedBy", required = false) String uploadedBy
    ) {
        try {
            if (file.isEmpty() || file.getOriginalFilename() == null || !file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Please upload a valid PDF document file (.pdf)!"));
            }

            User authUser = getAuthenticatedUserOrNull();
            Long userId = authUser != null ? authUser.getId() : null;
            String effectiveUploader = authUser != null ? authUser.getName() : (uploadedBy != null ? uploadedBy : "Student / Faculty");

            Document doc = pdfIngestionService.processAndStorePdf(file, semester, subject, effectiveUploader, userId);

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

        List<DocumentDto> dtos = docs.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> getDocumentById(@PathVariable Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        // Visibility and access policy:
        // System documents (userId == null) are public curriculum documents accessible to all.
        // User-uploaded documents (userId != null) are accessible only by the uploader or an ADMIN.
        if (doc.getUserId() != null) {
            User authUser = getAuthenticatedUserOrNull();
            boolean isOwner = authUser != null && doc.getUserId().equals(authUser.getId());
            boolean isAdmin = authUser != null && "ADMIN".equalsIgnoreCase(authUser.getRole());

            if (!isOwner && !isAdmin) {
                throw new UnauthorizedException("You do not have permission to access this document");
            }
        }

        return ResponseEntity.ok(toDto(doc));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        User authUser = getAuthenticatedUserOrNull();
        if (authUser == null) {
            throw new UnauthorizedException("You must be logged in to delete documents");
        }

        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        // Fix 1: Document deletion authorization logic
        // - A document owner can delete their own uploaded document (doc.getUserId() == authUser.getId())
        // - An ADMIN can delete documents
        // - A normal user must NEVER delete a system document where userId == null
        boolean isOwner = doc.getUserId() != null && doc.getUserId().equals(authUser.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(authUser.getRole());

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You do not have permission to delete this document");
        }

        chunkRepository.deleteByDocumentId(id);
        documentRepository.deleteById(id);

        return ResponseEntity.ok(Map.of("message", "Document and indexed chunks deleted successfully!"));
    }
}
