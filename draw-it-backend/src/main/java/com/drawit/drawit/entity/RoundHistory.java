package com.drawit.drawit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "round_history")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoundHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    private Integer roundNumber;
    private Integer turnNumber;

    private String wordSelected;

    private String drawerPlayerSessionId;
    private String drawerPlayerNickname;

    @Lob
    @Column(columnDefinition = "LONGTEXT") // For storing large base64 strings
    private String drawingData;

    private String drawingContainingText;
    private Integer penaltyPoints; // reduching point

    private String guesserPlayerSessionId;
    private String guesserPlayerNickname;

    private String finalGuess; // guessed word final
    private Boolean isCorrect;
    private Integer pointsEarned;

    private LocalDateTime createdAt;
}
