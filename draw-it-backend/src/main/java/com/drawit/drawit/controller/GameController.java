
package com.drawit.drawit.controller;


import com.drawit.drawit.dto.CreateGameRequestDto;
import com.drawit.drawit.dto.GameResponseDto;
import com.drawit.drawit.service.GameService;
import jakarta.servlet.http.HttpSession;
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
            log.error("Error creating game", e);
            throw new RuntimeException("Failed to create game: " + e.getMessage());
        }
    }
}
