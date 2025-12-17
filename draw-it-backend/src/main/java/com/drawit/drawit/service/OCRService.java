package com.drawit.drawit.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.Base64;

@Service
@Slf4j
public class OCRService {

    /**
     * Check if drawing contains text matching the keyword
     * For production: use Tesseract OCR or Google Vision API or AI
     * For now: simple heuristic check
     */
    public String containingKeywordText(String base64Image, String keyword) {
        try {
            // Remove data:image/png;base64, prefix if exists
            String imageData = base64Image.replaceFirst("^data:image/[^;]+;base64,", "");

            // Decode base64
            byte[] imageBytes = Base64.getDecoder().decode(imageData);

            log.info("OCR check for keyword '{}' - Image size: {} bytes", keyword, imageBytes.length);

            // Simple check: if image is too small, likely no text
            if (imageBytes.length < 1000) {
                return null;
            }

            // TODO: AI or Google OCR later
            // For now, return false (no text detection)
            // In real implementation:
            // 1. Convert to BufferedImage
            // 2. Run OCR
            // 3. Check if detected text contains keyword letters



            return keyword; // Placeholder

        } catch (Exception e) {
            log.error("OCR check failed", e);
            return null;
        }
    }

    /**
     * Calculate penalty points based on text detection
     */
    public int calculatePenalty(String containingKeyword) {
        if (containingKeyword != null) {
            return 0; // TODO no reduce point
        }
        return 0;
    }
}