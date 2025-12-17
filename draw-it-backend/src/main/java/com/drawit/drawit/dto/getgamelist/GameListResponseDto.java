package com.drawit.drawit.dto.getgamelist;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameListResponseDto {
    private Long totalGame;
    private List<GameListItemResponseDto> gameItemList;
}
