package com.drawit.drawit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "round_history_guess")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoundHistoryGuess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_history_id", nullable = false)
    private RoundHistory roundHistory;

    private String guesserPlayerSessionId;
    private String guesserPlayerNickname;

    private String guessedWord;
    private Boolean isCorrect;
    private Integer pointsEarned;

    private LocalDateTime createdAt;
}
