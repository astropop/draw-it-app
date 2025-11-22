package com.drawit.drawit.model;

import com.drawit.drawit.dto.PlayerDto;
import com.drawit.drawit.dto.RoundSpectatorDto;
import com.drawit.drawit.dto.WordStatusDto;
import com.drawit.drawit.enums.GameStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
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
    private Integer currentRound;
    private Integer drawingTime;
    private Integer guessingTime;

    // Words with used status
    private List<WordStatusDto> words = new ArrayList<>();

    // Players
    private List<PlayerDto> players = new ArrayList<>();

    // Current drawer session ID
    private String currentDrawerSessionId;

    // Round history
    private List<RoundSpectatorDto> rounds = new ArrayList<>();

    // Host ID
    private Long hostId;
}
