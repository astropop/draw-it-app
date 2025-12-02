package com.drawit.drawit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * tracking word status in each round
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WordStatusDto {
    private String word;
    private Integer usedInRound;
    private Integer usedInTurn;
    private String usedByPlayerSessionId;
    private String usedByPlayerNickname;
}