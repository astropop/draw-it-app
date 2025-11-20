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
    private Boolean used;
    private Integer usedInRound;
    private String usedByPlayer;
}