
package com.drawit.drawit.dto.creategame;


import com.drawit.drawit.enums.GameMode;
import lombok.Data;

/**
 * request from frontend
 */
@Data
public class CreateGameRequestDto {
    private String hostNickname;
    private String theme;
    private Integer maxRounds;
    // drawing time per round
    private Integer drawingTime;
    // guessing time per round
    private Integer guessingTime;
    // DEFAULT : VERSUS
    private GameMode gameMode;
}
