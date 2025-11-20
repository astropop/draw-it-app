package com.drawit.drawit.dto;


import com.drawit.drawit.enums.GameStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameSpectatorDto {
    private String gameCode;
    private String theme;
    private GameStatus status;
    private Integer currentRound;
    private Integer maxRounds;
    private List<PlayerDto> players;
    private RoundSpectatorDto currentRoundInfo;
    private List<RoundSpectatorDto> allRounds;
}