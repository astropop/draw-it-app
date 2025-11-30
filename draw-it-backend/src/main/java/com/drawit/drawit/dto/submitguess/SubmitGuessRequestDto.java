package com.drawit.drawit.dto.submitguess;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitGuessRequestDto {
    private Integer roundId;
    private String playerSessionId;
    private String guess;
    private Integer guessingTime; // time for drawing
}