package com.drawit.drawit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitDrawingRequestDto {
    @NotNull(message = "Round ID required")
    private Integer roundId;

    @NotBlank(message = "Drawing data required")
    private String drawingData; // base64 image

    @NotBlank(message = "Selected word required")
    private String selectedWord;

    @NotBlank
    private String playerSessionId;
}
