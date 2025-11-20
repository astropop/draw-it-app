package com.drawit.drawit.service;


import com.drawit.drawit.dto.CreateGameRequestDto;
import com.drawit.drawit.dto.GameResponseDto;
import com.drawit.drawit.dto.PlayerDto;
import com.drawit.drawit.entity.Game;
import com.drawit.drawit.entity.GuestPlayer;
import com.drawit.drawit.enums.GameStatus;
import com.drawit.drawit.repository.GameRepository;
import com.drawit.drawit.repository.GuestPlayerRepository;
import com.drawit.drawit.repository.WordCacheRepository;
import com.drawit.drawit.util.GameCodeGenerator;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class GameService {

    @Autowired
    private GameRepository gameRepository;
    @Autowired
    private GuestPlayerRepository guestPlayerRepository;
    @Autowired
    private HuggingFaceService huggingFaceService;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    @Autowired
    private WordCacheRepository wordCacheRepository;

    @Transactional
    public GameResponseDto createGame(CreateGameRequestDto request, HttpSession session) {
        String theme = request.getTheme().trim().toLowerCase();
        log.info("Creating game with theme: {}", theme);


        // Generate unique game code
        String gameCode;
        do {
            gameCode = GameCodeGenerator.generate();
        } while (gameRepository.existsByGameCode(gameCode));

        // Create game
        Game game = new Game();
        game.setGameCode(gameCode);
        game.setGameMode(request.getGameMode());
        game.setStatus(GameStatus.WAITING);
        game.setTheme(request.getTheme());
        game.setLanguage("English"); // Default
        game.setMaxRounds(request.getMaxRounds());
        game.setDrawingTime(request.getDrawingTime());
        game.setGuessingTime(request.getGuessingTime());

        // Save game first to get ID
        game = gameRepository.save(game);

        // Create host player
        GuestPlayer host = new GuestPlayer();
        host.setNickname(request.getHostNickname());
        host.setIsHost(true);
        host.setJoinedOrder(0);
        host.setGame(game);
        host = guestPlayerRepository.save(host);


        // Set host game reference and ID
        // Update game with host ID
        game.setHostId(host.getId());
        game = gameRepository.save(game);

        // Store session
        session.setAttribute("sessionId", host.getSessionId());
        session.setAttribute("gameCode", gameCode);
        session.setAttribute("nickname", host.getNickname());

        // Generate words using HuggingFace (or default)


        int wordCount = Math.max(request.getMaxRounds() + 2, 7);
        List<String> words = huggingFaceService.getOrCreateKeywords(request.getTheme(), wordCount);

        // Cache in Redis
        String redisKey = "game:" + gameCode;
        Map<String, Object> gameState = new HashMap<>();
        gameState.put("gameId", game.getId().toString());
        gameState.put("words", words);
        gameState.put("hostSessionId", host.getSessionId());
        gameState.put("status", game.getStatus().name());

        redisTemplate.opsForHash().putAll(redisKey, gameState);
        redisTemplate.expire(redisKey, 2, TimeUnit.HOURS);

        log.info("Game created successfully: {}", gameCode);
        log.info("Game created successfullyRedis: {}", redisTemplate.opsForHash().get(redisKey, "words"));

        // Build response
        return GameResponseDto.builder()
                .gameId(game.getId())
                .gameCode(gameCode)
                .sessionId(host.getSessionId())
                .status(GameStatus.WAITING)
                .theme(game.getTheme())
                .maxRounds(game.getMaxRounds())
                .currentRound(0)
                .drawingTime(game.getDrawingTime())
                .guessingTime(game.getGuessingTime())
                .isHost(true)
                .words(words)
                .players(List.of(convertToPlayerDTO(host)))
                .build();
    }

    private PlayerDto convertToPlayerDTO(GuestPlayer player) {
        return new PlayerDto(
                player.getNickname(),
                player.getScore(),
                player.getIsHost(),
                player.getSessionId(),
                player.getJoinedOrder()
        );
    }
}