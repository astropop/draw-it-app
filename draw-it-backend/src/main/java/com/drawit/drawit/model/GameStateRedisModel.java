package com.drawit.drawit.model;

import com.drawit.drawit.dto.PlayerDto;
import com.drawit.drawit.dto.spectategame.SpectateGameRoundDto;
import com.drawit.drawit.dto.WordStatusDto;
import com.drawit.drawit.enums.GameStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameStateRedisModel implements Serializable {
    private Long gameId;
    private String gameCode;
    private String theme;
    private GameStatus status;
    private Integer maxRounds;
    private Integer currentRound; // 1,2,3,4,5
    private Integer currentTurnNum; // 0 : drawing, 1: guessing, increased by 1

    private Integer drawingTime;
    private Integer guessingTime;

    // Words with used status
    private List<WordStatusDto> words = new ArrayList<>();

    // Players
    private List<PlayerDto> players = new ArrayList<>();

    // Current drawer session ID
    private String currentDrawerSessionId; // missed guesser TODO

    // Round history
    private List<SpectateGameRoundDto> rounds = new ArrayList<>();

    // Host ID
    private Long hostId;
    private String hostPlayerSessionId;

    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
}
