
package com.drawit.drawit.controller;


import com.drawit.drawit.dto.*;
import com.drawit.drawit.service.GameService;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class GameController {
    @Autowired
    private GameService gameService;


    @GetMapping("/list")
    public ResponseEntity<List<GameListItemDto>> getGameList() {
        List<GameListItemDto> games = gameService.getGameList();
        return ResponseEntity.ok(games);
    }

    @PostMapping("/create")
    public ResponseEntity<GameResponseDto> createGame(
            @Valid @RequestBody CreateGameRequestDto createGameRequestDto
    ) {
        try {
            GameResponseDto response = gameService.createGame(createGameRequestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error createGame", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/join")
    public ResponseEntity<GameResponseDto> joinGame(
            @Valid @RequestBody JoinGameRequestDto joinGameRequestDto
    ) {
        GameResponseDto response = gameService.joinGame(joinGameRequestDto);
        return ResponseEntity.ok(response);
    }



    @GetMapping("/{gameCode}/spectate")
    public ResponseEntity<GameSpectatorDto> spectateGame(@PathVariable String gameCode) {
        GameSpectatorDto spectator = gameService.spectateGame(gameCode);
        return ResponseEntity.ok(spectator);
    }

    // Re-join game, need sessionId of player
    @PostMapping("/{gameCode}")
    public ResponseEntity<GameResponseDto> getGame(
            @PathVariable String gameCode,
            @Valid @RequestBody PlayerSessionDto playerSessionDto
    ) {
        String playerSessionId = playerSessionDto.getPlayerSessionId();
        GameResponseDto game = gameService.getGame(gameCode, playerSessionId);
        return ResponseEntity.ok(game);
    }


    @PostMapping("/{gameCode}/start")
    public ResponseEntity<GameResponseDto> startGame(
            @PathVariable String gameCode,
            @Valid @RequestBody PlayerSessionDto playerSessionDto
    ) {
        String playerSessionId = playerSessionDto.getPlayerSessionId();
        GameResponseDto response = gameService.startGame(gameCode, playerSessionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{gameCode}/submit-drawing")
    public ResponseEntity<SubmitDrawingResponseDto> submitDrawing(
            @PathVariable String gameCode,
            @Valid @RequestBody SubmitDrawingRequestDto submitDrawingRequestDto
    ) {
        SubmitDrawingResponseDto response = gameService.submitDrawing(gameCode, submitDrawingRequestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{gameCode}/submit-guess")
    public ResponseEntity<SubmitGuessResponseDto> submitGuess(
            @PathVariable String gameCode,
            @Valid @RequestBody SubmitGuessRequestDto submitGuessRequestDto
    ) {
        SubmitGuessResponseDto response = gameService.submitGuess(gameCode, submitGuessRequestDto);
        return ResponseEntity.ok(response);
    }
}
