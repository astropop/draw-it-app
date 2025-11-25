package com.drawit.drawit.dto.websocket;

import lombok.Data;

@Data
public class GuessSubmittedRequestDto {
    private String guess;
    private Integer roundId;
}