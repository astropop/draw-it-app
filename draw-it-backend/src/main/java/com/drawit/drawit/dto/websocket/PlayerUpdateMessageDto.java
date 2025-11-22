package com.drawit.drawit.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerUpdateMessageDto {
    private String type; // "PLAYER_JOINED", "PLAYER_LEFT", "SCORE_UPDATED"
    private String nickname;
    private String sessionId;
    private Integer score;
}