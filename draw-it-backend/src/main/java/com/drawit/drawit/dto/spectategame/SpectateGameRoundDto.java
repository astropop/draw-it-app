package com.drawit.drawit.dto.spectategame;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SpectateGameRoundDto {
    private Integer roundNumber;
    private String drawerNickname;
    private String drawerPlayerSessionId;
    private String selectedWord;
    private String drawingData;
    private Boolean containsText;

    private List<GuessDto> guesses;
}