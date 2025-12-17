
package com.drawit.drawit.controller;


import com.drawit.drawit.dto.GameResponseDto;
import com.drawit.drawit.dto.creategame.CreateGameRequestDto;
import com.drawit.drawit.dto.getgame.GetGameRequestDto;
import com.drawit.drawit.dto.getgamelist.GameListResponseDto;
import com.drawit.drawit.dto.joingame.JoinGameRequestDto;
import com.drawit.drawit.dto.spectategame.SpectateGameResponseDto;
import com.drawit.drawit.dto.startgame.StartGameRequestDto;
import com.drawit.drawit.dto.submitdrawing.SubmitDrawingRequestDto;
import com.drawit.drawit.dto.submitdrawing.SubmitDrawingResponseDto;
import com.drawit.drawit.dto.submitguess.SubmitGuessRequestDto;
import com.drawit.drawit.dto.submitguess.SubmitGuessResponseDto;
import com.drawit.drawit.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${spring.web.cors.allowed-origins}")
public class GameController {
    @Autowired
    private GameService gameService;


    @GetMapping("/list")
    public ResponseEntity<GameListResponseDto> getGameList(@RequestParam(defaultValue = "1") int page,
                                                           @RequestParam(defaultValue = "12") int pageSize,
                                                           @RequestParam(defaultValue = "desc") String sort) {
        try {
            GameListResponseDto games = gameService.getGameList(page, pageSize, sort);
            return ResponseEntity.ok(games);
        } catch (Exception e) {
            log.error("Error getGameList", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
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
        try {
            GameResponseDto response = gameService.joinGame(joinGameRequestDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error joinGame", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }


    @GetMapping("/{gameCode}/spectate")
    public ResponseEntity<SpectateGameResponseDto> spectateGame(@PathVariable String gameCode) {
        try {
            SpectateGameResponseDto spectator = gameService.spectateGame(gameCode);
            return ResponseEntity.ok(spectator);
        } catch (Exception e) {
            log.error("Error spectateGame", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Re-join game, join game, need information of player
    @PostMapping("/{gameCode}")
    public ResponseEntity<GameResponseDto> getGame(
            @PathVariable String gameCode,
            @Valid @RequestBody GetGameRequestDto body
    ) {
        try {
            GameResponseDto game = gameService.getGame(gameCode, body);
            return ResponseEntity.ok(game);
        } catch (Exception e) {
            log.error("Error getGame", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }


    /**
     * change status of the game to in_progress, set first turn for random player
     *
     * @param gameCode game code starts
     * @param body     information of player pressed
     * @return information of the game with new status
     */
    @PostMapping("/{gameCode}/start")
    public ResponseEntity<GameResponseDto> startGame(
            @PathVariable String gameCode,
            @Valid @RequestBody StartGameRequestDto body
    ) {
        try {
            GameResponseDto response = gameService.startGame(gameCode, body);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error startGame", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/{gameCode}/submit-drawing")
    public ResponseEntity<SubmitDrawingResponseDto> submitDrawing(
            @PathVariable String gameCode,
            @Valid @RequestBody SubmitDrawingRequestDto submitDrawingRequestDto
    ) {
        try {
            SubmitDrawingResponseDto response = gameService.submitDrawing(gameCode, submitDrawingRequestDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error submitDrawing", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/{gameCode}/submit-guess")
    public ResponseEntity<SubmitGuessResponseDto> submitGuess(
            @PathVariable String gameCode,
            @Valid @RequestBody SubmitGuessRequestDto submitGuessRequestDto
    ) {
        try {
            SubmitGuessResponseDto response = gameService.submitGuess(gameCode, submitGuessRequestDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error submitGuess", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}
