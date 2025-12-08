package com.drawit.drawit.entity;

import jakarta.persistence.*;
import lombok.Data;

/**
 * store created words
 */

@Entity
@Table(name = "game_words")
@Data
public class GameWord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String word;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;


}