package com.drawit.drawit.entity;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * table guest_players, all players each game
 */
@Entity
@Table(name = "guest_players")
@Data
public class GuestPlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nickname;

    @Column(unique = true, nullable = false)
    private String sessionId = UUID.randomUUID().toString();

    @Column(nullable = false)
    private Integer score = 0;

    @Column(nullable = false)
    private Boolean isHost = false;

    @Column(nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    private Integer joinedOrder;
}

