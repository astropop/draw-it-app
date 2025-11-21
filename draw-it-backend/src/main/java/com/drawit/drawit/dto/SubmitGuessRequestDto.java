package com.drawit.drawit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitGuessRequestDto {
    @NotNull(message = "Round ID required")
    private Integer roundId;

    @NotBlank(message = "Guess required")
    private String guess;

    @NotBlank
    private String playerSessionId;
}