package com.drawit.drawit.dto.joingame;


import lombok.Data;

/**
 * request from front end side
 */
@Data
public class JoinGameRequestDto {

    private String gameCode;

    private String nickname;
}