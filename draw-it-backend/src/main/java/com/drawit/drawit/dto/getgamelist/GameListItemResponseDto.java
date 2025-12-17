package com.drawit.drawit.dto.getgamelist;

import com.drawit.drawit.enums.GameStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * response for displaying FE
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameListItemResponseDto {
    private String gameCode;
    private String theme;
    private GameStatus status;
    private Integer playerCount;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}