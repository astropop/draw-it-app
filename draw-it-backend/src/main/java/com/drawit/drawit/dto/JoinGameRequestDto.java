package com.drawit.drawit.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * request from front end side
 */
@Data
public class JoinGameRequestDto {
    @NotBlank(message = "Game code is required")
    @Size(min = 8, max = 8, message = "Game code must be 8 characters")
    private String gameCode;

    @NotBlank(message = "Nickname is required")
    @Size(max = 50, message = "Nickname too long")
    private String nickname;
}