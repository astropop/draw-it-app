package com.drawit.drawit.dto.websocket;

import com.drawit.drawit.dto.PlayerDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerListUpdateDto {
    private List<PlayerDto> players;
}