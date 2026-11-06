package com.college.assistant.service;

import com.college.assistant.entity.Document;
import com.college.assistant.entity.DocumentChunk;
import com.college.assistant.repository.DocumentChunkRepository;
import com.college.assistant.repository.DocumentRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfIngestionService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentChunkRepository documentChunkRepository;

    @Transactional(rollbackFor = Exception.class)
    public Document processAndStorePdf(MultipartFile file, String semester, String subject, String uploadedBy, Long userId) throws IOException {
        Document doc = Document.builder()
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .semester(semester)
                .subject(subject)
                .uploadedBy(uploadedBy != null ? uploadedBy : "Student / Faculty")
                .userId(userId)
                .build();

        Document savedDoc = documentRepository.save(doc);

        List<DocumentChunk> chunks = new ArrayList<>();
        byte[] bytes = file.getBytes();

        try (PDDocument pdDocument = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            int totalPages = pdDocument.getNumberOfPages();
            int chunkIndex = 0;

            for (int page = 1; page <= totalPages; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);
                String pageText = stripper.getText(pdDocument).trim();

                if (pageText.isEmpty()) continue;

                // Split page text into ~750-800 character logical chunks
                String[] paragraphs = pageText.split("\n\n");
                StringBuilder currentChunk = new StringBuilder();

                for (String para : paragraphs) {
                    currentChunk.append(para.trim()).append("\n");
                    if (currentChunk.length() > 750) {
                        DocumentChunk chunk = DocumentChunk.builder()
                                .documentId(savedDoc.getId())
                                .chunkIndex(chunkIndex++)
                                .pageNumber(page)
                                .content(currentChunk.toString().trim())
                                .semester(semester)
                                .subject(subject)
                                .documentName(savedDoc.getFileName())
                                .build();
                        chunks.add(chunk);
                        currentChunk = new StringBuilder();
                    }
                }

                if (currentChunk.length() > 0) {
                    DocumentChunk chunk = DocumentChunk.builder()
                            .documentId(savedDoc.getId())
                            .chunkIndex(chunkIndex++)
                            .pageNumber(page)
                            .content(currentChunk.toString().trim())
                            .semester(semester)
                            .subject(subject)
                            .documentName(savedDoc.getFileName())
                            .build();
                    chunks.add(chunk);
                }
            }
        }

        if (!chunks.isEmpty()) {
            documentChunkRepository.saveAll(chunks);
        }

        return savedDoc;
    }
}
