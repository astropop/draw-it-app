package com.drawit.drawit.dto.submitguess;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitGuessRequestDto {
    private Integer roundNumber;
    private Integer turnNumber;
    private String guess; // guessing text
    private Integer guessingTimeLeft; // time for drawing
    private String playerSessionId;
}