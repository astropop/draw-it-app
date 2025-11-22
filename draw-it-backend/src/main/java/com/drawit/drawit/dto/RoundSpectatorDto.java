package com.drawit.drawit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoundSpectatorDto {
    private Integer roundNumber;
    private String drawer;
    private String selectedWord;
    private String drawingData;
    private Boolean containsText;
    private List<GuessDto> guesses;
}