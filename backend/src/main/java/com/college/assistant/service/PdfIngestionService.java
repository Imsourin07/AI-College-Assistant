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

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PdfIngestionService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentChunkRepository documentChunkRepository;

    public Document processAndStorePdf(MultipartFile file, String semester, String subject, String uploadedBy) throws IOException {
        // Save document record
        Document doc = Document.builder()
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .semester(semester)
                .subject(subject)
                .uploadedBy(uploadedBy != null ? uploadedBy : "College Staff / Student")
                .build();

        Document savedDoc = documentRepository.save(doc);

        // Extract PDF text per page using Apache PDFBox 3.x
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

                // Split page text into ~300 word logical chunks
                String[] paragraphs = pageText.split("\n\n");
                StringBuilder currentChunk = new StringBuilder();

                for (String para : paragraphs) {
                    currentChunk.append(para.trim()).append("\n");
                    if (currentChunk.length() > 800) { // ~200-300 words
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
