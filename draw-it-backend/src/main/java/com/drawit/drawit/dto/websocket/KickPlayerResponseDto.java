package com.drawit.drawit.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KickPlayerResponseDto {
    private Boolean kicked;
    private String reason;
    private String gameCode;
}