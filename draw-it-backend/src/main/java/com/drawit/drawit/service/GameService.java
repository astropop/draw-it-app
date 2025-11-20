package com.drawit.drawit.service;


import com.drawit.drawit.dto.*;
import com.drawit.drawit.entity.Game;
import com.drawit.drawit.entity.GuestPlayer;
import com.drawit.drawit.enums.GameStatus;
import com.drawit.drawit.model.GameStateRedisModel;
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
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

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
        List<String> rawWords  = huggingFaceService.getOrCreateKeywords(request.getTheme(), wordCount);
        // convert to wordstatusdto
        List<WordStatusDto> words = rawWords.stream()
                .map(w -> new WordStatusDto(w, false, null, null))
                .collect(Collectors.toList());

        // Cache in Redis
//        String redisKey = "game:" + gameCode;
//        Map<String, Object> gameState = new HashMap<>();
//        gameState.put("gameId", game.getId().toString());
//        gameState.put("words", words);
//        gameState.put("hostSessionId", host.getSessionId());
//        gameState.put("status", game.getStatus().name());
//
//        redisTemplate.opsForHash().putAll(redisKey, gameState);
//        redisTemplate.expire(redisKey, 2, TimeUnit.HOURS);

        // Store in Redis
        GameStateRedisModel redisState = GameStateRedisModel.builder()
                .gameId(game.getId())
                .gameCode(gameCode)
                .theme(game.getTheme())
                .status(GameStatus.WAITING)
                .maxRounds(game.getMaxRounds())
                .currentRound(0)
                .drawingTime(game.getDrawingTime())
                .guessingTime(game.getGuessingTime())
                .words(words)
                .players(List.of(convertToPlayerDto(host)))
                .hostId(host.getId())
                .rounds(new ArrayList<>())
                .build();

        String redisKey = "game::" + gameCode;
        // store in redis 2h
        redisTemplate.opsForValue().set(redisKey, redisState, 2, TimeUnit.HOURS);

        log.info("Game created successfully: {}", gameCode);
//        log.info("Game created successfullyRedis: {}", redisTemplate.opsForHash().;

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
                .words(rawWords)
                .players(List.of(convertToPlayerDto(host)))
                .build();
    }

    @Transactional
    public GameResponseDto joinGame(JoinGameRequestDto request, HttpSession session) {
        // 1. Find game
        Game game = gameRepository.findByGameCode(request.getGameCode())
                .orElseThrow(() -> new RuntimeException("Game not found: " + request.getGameCode()));

        // 2. Check if game is joinable
        if (game.getStatus() != GameStatus.WAITING) {
            throw new RuntimeException("Game already started or finished");
        }

        // 3. Check max players (2 for VERSUS mode)
        long currentPlayers = guestPlayerRepository.countByGameAndIsActiveTrue(game);
        if (currentPlayers >= 2) {
            throw new RuntimeException("Game is full (max 2 players for VERSUS mode)");
        }

        // 4. Create new player
        GuestPlayer player = new GuestPlayer();
        player.setNickname(request.getNickname());
        player.setGame(game);
        player.setIsHost(false);
        player.setJoinedOrder((int) currentPlayers);
        player = guestPlayerRepository.save(player);

        // 5. Update Redis state
        String redisKey = "game::" + request.getGameCode();
        ObjectMapper mapper = new ObjectMapper();
        GameStateRedisModel redisState = mapper.convertValue( redisTemplate.opsForValue().get(redisKey), GameStateRedisModel.class);

        if (redisState == null) {
            // Reconstruct from DB if missing
            redisState = reconstructRedisState(game);
        }

        // Add player to redis
        PlayerDto newPlayerDTO = convertToPlayerDto(player);
        redisState.getPlayers().add(newPlayerDTO);
        redisTemplate.opsForValue().set(redisKey, redisState, 2, TimeUnit.HOURS);

        // 6. Session
        session.setAttribute("sessionId", player.getSessionId());
        session.setAttribute("gameCode", request.getGameCode());
        session.setAttribute("nickname", player.getNickname());

        log.info("Player {} joined game {}", player.getNickname(), request.getGameCode());

        // 7. Return response
        List<String> availableWords = redisState.getWords().stream()
                .filter(w -> !w.getUsed())
                .map(WordStatusDto::getWord)
                .collect(Collectors.toList());

        return GameResponseDto.builder()
                .gameId(game.getId())
                .gameCode(game.getGameCode())
                .sessionId(player.getSessionId())
                .status(game.getStatus())
                .theme(game.getTheme())
                .maxRounds(game.getMaxRounds())
                .currentRound(game.getCurrentRound())
                .drawingTime(game.getDrawingTime())
                .guessingTime(game.getGuessingTime())
                .isHost(false)
                .words(availableWords)
                .players(redisState.getPlayers())
                .build();
    }

    /**
     * GET GAME LIST
     * @return
     */
    public List<GameListItemDto> getGameList() {
        List<Game> games = gameRepository.findByStatusIn(
                List.of(GameStatus.WAITING, GameStatus.IN_PROGRESS)
        );

        return games.stream()
                .map(game -> {
                    int playerCount = guestPlayerRepository.countByGameAndIsActiveTrue(game).intValue();

                    return GameListItemDto.builder()
                            .gameCode(game.getGameCode())
                            .theme(game.getTheme())
                            .status(game.getStatus())
                            .playerCount(playerCount)
                            .createdAt(game.getCreatedAt())
                            .startedAt(game.getStartedAt())
                            .finishedAt(game.getFinishedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * SPECTATE GAME
     * @param gameCode
     * @return
     */
    public GameSpectatorDto spectateGame(String gameCode) {
        // Try Redis first
        String redisKey = "game::" + gameCode;
        GameStateRedisModel redisState = (GameStateRedisModel) redisTemplate.opsForValue().get(redisKey);

        if (redisState == null) {
            // Fallback to DB
            Game game = gameRepository.findByGameCode(gameCode)
                    .orElseThrow(() -> new RuntimeException("Game not found"));
            redisState = reconstructRedisState(game);
        }

        // Build spectator DTO
        RoundSpectatorDto currentRoundInfo = null;
        List<RoundSpectatorDto> allRounds = null;

        if (redisState.getStatus() == GameStatus.IN_PROGRESS && !redisState.getRounds().isEmpty()) {
            // Current round is last in list
            currentRoundInfo = redisState.getRounds().get(redisState.getRounds().size() - 1);
        }

        if (redisState.getStatus() == GameStatus.FINISHED) {
            // Show all rounds for finished games
            allRounds = redisState.getRounds();
        }

        return GameSpectatorDto.builder()
                .gameCode(redisState.getGameCode())
                .theme(redisState.getTheme())
                .status(redisState.getStatus())
                .currentRound(redisState.getCurrentRound())
                .maxRounds(redisState.getMaxRounds())
                .players(redisState.getPlayers())
                .currentRoundInfo(currentRoundInfo)
                .allRounds(allRounds)
                .build();
    }


    /**
     * GET GAME (for player)
     * @param gameCode
     * @param session
     * @return
     */
    public GameResponseDto getGame(String gameCode, HttpSession session) {
        String sessionId = (String) session.getAttribute("sessionId");

        if (sessionId == null) {
            throw new RuntimeException("No session found. Please join the game first.");
        }

        // Get from Redis
        String redisKey = "game::" + gameCode;
        GameStateRedisModel redisState = (GameStateRedisModel) redisTemplate.opsForValue().get(redisKey);

        if (redisState == null) {
            Game game = gameRepository.findByGameCode(gameCode)
                    .orElseThrow(() -> new RuntimeException("Game not found"));
            redisState = reconstructRedisState(game);
        }

        // Find player
        Optional<PlayerDto> currentPlayer = redisState.getPlayers().stream()
                .filter(p -> p.getSessionId().equals(sessionId))
                .findFirst();

        if (currentPlayer.isEmpty()) {
            throw new RuntimeException("You are not in this game");
        }

        // Return available words (not used)
        List<String> availableWords = redisState.getWords().stream()
                .filter(w -> !w.getUsed())
                .map(WordStatusDto::getWord)
                .collect(Collectors.toList());

        return GameResponseDto.builder()
                .gameId(redisState.getGameId())
                .gameCode(redisState.getGameCode())
                .sessionId(sessionId)
                .status(redisState.getStatus())
                .theme(redisState.getTheme())
                .maxRounds(redisState.getMaxRounds())
                .currentRound(redisState.getCurrentRound())
                .drawingTime(redisState.getDrawingTime())
                .guessingTime(redisState.getGuessingTime())
                .isHost(currentPlayer.get().getIsHost())
                .words(availableWords)
                .players(redisState.getPlayers())
                .currentDrawerSessionId(redisState.getCurrentDrawerSessionId())
                .build();
    }

    private PlayerDto convertToPlayerDto(GuestPlayer player) {
        return new PlayerDto(
                player.getNickname(),
                player.getScore(),
                player.getIsHost(),
                player.getSessionId(),
                player.getJoinedOrder()
        );
    }

    private GameStateRedisModel reconstructRedisState(Game game) {
        List<GuestPlayer> players = guestPlayerRepository.findByGameAndIsActiveTrueOrderByJoinedOrderAsc(game);
        List<PlayerDto> playerDTOs = players.stream()
                .map(this::convertToPlayerDto)
                .collect(Collectors.toList());

        // Reconstruct words (simplified - assume not used if game not started)
        List<String> rawWords = huggingFaceService.getOrCreateKeywords(game.getTheme(), game.getMaxRounds() + 3);
        List<WordStatusDto> words = rawWords.stream()
                .map(w -> new WordStatusDto(w, false, null, null))
                .collect(Collectors.toList());

        return GameStateRedisModel.builder()
                .gameId(game.getId())
                .gameCode(game.getGameCode())
                .theme(game.getTheme())
                .status(game.getStatus())
                .maxRounds(game.getMaxRounds())
                .currentRound(game.getCurrentRound())
                .drawingTime(game.getDrawingTime())
                .guessingTime(game.getGuessingTime())
                .words(words)
                .players(playerDTOs)
                .hostId(game.getHostId())
                .rounds(new ArrayList<>())
                .build();
    }
}