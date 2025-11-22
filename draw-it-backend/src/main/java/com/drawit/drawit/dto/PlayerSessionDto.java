package com.drawit.drawit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PlayerSessionDto {
    @NotBlank
    private String playerSessionId;
}
