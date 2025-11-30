package com.drawit.drawit.dto.submitdrawing;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitDrawingRequestDto {
    private Integer roundId;
    private String drawingData; // base64 image
    private String selectedWord;
    private String playerSessionId;
}
