package com.drawit.drawit.dto.submitguess;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubmitGuessResponseDto {
    private Boolean isCorrect;
    private Integer pointsEarned;
    private String correctWord;
    private Boolean roundComplete;
}