
package com.drawit.drawit.controller;


import com.drawit.drawit.dto.*;
import com.drawit.drawit.service.GameService;
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

    @PostMapping("/create")
    public ResponseEntity<GameResponseDto> createGame(
            @Valid @RequestBody CreateGameRequestDto request,
            HttpSession session
    ) {
        log.info("POST /api/games/create - Theme: {}", request.getTheme());

        try {
            GameResponseDto response = gameService.createGame(request, session);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error createGame", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/join")
    public ResponseEntity<GameResponseDto> joinGame(
            @Valid @RequestBody JoinGameRequestDto request,
            HttpSession session
    ) {
        GameResponseDto response = gameService.joinGame(request, session);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    public ResponseEntity<List<GameListItemDto>> getGameList() {
        List<GameListItemDto> games = gameService.getGameList();
        return ResponseEntity.ok(games);
    }

    @GetMapping("/{gameCode}/spectate")
    public ResponseEntity<GameSpectatorDto> spectateGame(@PathVariable String gameCode) {
        GameSpectatorDto spectator = gameService.spectateGame(gameCode);
        return ResponseEntity.ok(spectator);
    }

    @GetMapping("/{gameCode}")
    public ResponseEntity<GameResponseDto> getGame(
            @PathVariable String gameCode,
            HttpSession session
    ) {
        GameResponseDto game = gameService.getGame(gameCode, session);
        return ResponseEntity.ok(game);
    }
}
