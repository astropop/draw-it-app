package com.drawit.drawit.dto.spectategame;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GuessDto {
    private String playerNickname;
    private String playerSessionId;
    private String guessedWord;
    private Boolean isCorrect;
    private Integer pointsEarned;
    private LocalDateTime submittedAt;
}