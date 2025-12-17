package com.drawit.drawit.dto.getgame;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GetGameRequestDto {
    @NotBlank
    private String playerSessionId;
}
