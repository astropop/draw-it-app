package com.drawit.drawit.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GuessSubmittedMessageDto {
    private Integer roundId;
    private String playerNickname;
    private String guess;
    private Boolean isCorrect;
    private Integer pointsEarned;
}