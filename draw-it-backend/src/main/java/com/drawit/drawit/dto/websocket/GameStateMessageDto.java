package com.drawit.drawit.dto.websocket;

import com.drawit.drawit.enums.GameStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameStateMessageDto {
    private String type; // "GAME_STARTED", "NEXT_ROUND", "GAME_FINISHED"
    private String gameCode;
    private Integer currentRound;
    private Integer maxRounds;
    private String currentDrawer;
    private GameStatus status;
}