package com.drawit.drawit.entity;

import com.drawit.drawit.enums.GameMode;
import com.drawit.drawit.enums.GameStatus;
import jakarta.persistence.*;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * table games, store all games
 */

@Entity
@Table(name = "games")
@Data
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 8)
    private String gameCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameMode gameMode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameStatus status = GameStatus.WAITING;

    @Column(nullable = false)
    private String theme;

    @Column(nullable = false)
    private String language = "English";

    @Column(nullable = false)
    private Integer maxRounds;

    @Column(nullable = false)
    private Integer currentRound = 0;

    @Column(nullable = false)
    private Integer drawingTime;

    @Column(nullable = false)
    private Integer guessingTime;

    @Column
    private Long hostId;

    @Column
    private String hostPlayerSessionId;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GuestPlayer> players = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime startedAt;

    private LocalDateTime finishedAt;
}