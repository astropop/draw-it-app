package com.drawit.drawit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlayerDto {
    private String nickname;
    private Integer score;
    /**
     *  true: this player is host
     */
    private Boolean isHost;

    /**
     * sessionId to play a game
     */
    private String sessionId;

    /**
     * join the game at specific order
     */
    private Integer joinedOrder;
}