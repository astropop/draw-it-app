package com.drawit.drawit.dto.spectategame;


import com.drawit.drawit.dto.PlayerDto;
import com.drawit.drawit.enums.GameStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SpectateGameDto {
    private String gameCode;
    private String theme;
    private GameStatus status;
    private Integer currentRound;
    private Integer maxRounds;
    private List<PlayerDto> playersInGame;

    // show all rounds in real time
    private List<SpectateGameRoundDto> allRounds;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}