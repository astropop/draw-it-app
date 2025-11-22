// src/main/java/com/drawinggame/dto/CreateGameRequest.java
package com.drawit.drawit.dto;


import com.drawit.drawit.enums.GameMode;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * request is sent from frontend
 */
@Data
public class CreateGameRequestDto {
    @NotBlank(message = "Host nickname is required")
    @Size(max = 50, message = "Nickname must not exceed 50 characters")
    private String hostNickname;

    @NotBlank(message = "Theme is required")
    @Size(max = 100, message = "Theme must not exceed 100 characters")
    private String theme;

    @NotNull(message = "Max rounds is required")
    @Min(value = 1, message = "Must have at least 1 round")
    @Max(value = 5, message = "Maximum 5 rounds allowed")
    private Integer maxRounds;

    @NotNull(message = "Drawing time is required")
    @Min(value = 30, message = "Minimum 30 seconds for drawing")
    @Max(value = 300, message = "Maximum 300 seconds for drawing")
    private Integer drawingTime;

    @NotNull(message = "Guessing time is required")
    @Min(value = 30, message = "Minimum 30 seconds for guessing")
    @Max(value = 180, message = "Maximum 180 seconds for guessing")
    private Integer guessingTime;

    @NotNull(message = "Game mode is required")
    private GameMode gameMode;
}
