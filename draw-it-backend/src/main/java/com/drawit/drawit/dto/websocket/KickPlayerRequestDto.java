package com.drawit.drawit.dto.websocket;


import lombok.Data;

@Data
public class KickPlayerRequestDto {
    private String targetSessionId;
}