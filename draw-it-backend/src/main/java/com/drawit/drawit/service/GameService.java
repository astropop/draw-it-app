package com.drawit.drawit.service;


import com.drawit.drawit.dto.GameResponseDto;
import com.drawit.drawit.dto.PlayerDto;
import com.drawit.drawit.dto.WordStatusDto;
import com.drawit.drawit.dto.creategame.CreateGameRequestDto;
import com.drawit.drawit.dto.getgame.GetGameRequestDto;
import com.drawit.drawit.dto.getgamelist.GameListItemResponseDto;
import com.drawit.drawit.dto.getgamelist.GameListResponseDto;
import com.drawit.drawit.dto.joingame.JoinGameRequestDto;
import com.drawit.drawit.dto.spectategame.GuessDto;
import com.drawit.drawit.dto.spectategame.SpectateGameResponseDto;
import com.drawit.drawit.dto.spectategame.SpectateGameRoundDto;
import com.drawit.drawit.dto.startgame.StartGameRequestDto;
import com.drawit.drawit.dto.submitdrawing.SubmitDrawingRequestDto;
import com.drawit.drawit.dto.submitdrawing.SubmitDrawingResponseDto;
import com.drawit.drawit.dto.submitguess.SubmitGuessRequestDto;
import com.drawit.drawit.dto.submitguess.SubmitGuessResponseDto;
import com.drawit.drawit.entity.Game;
import com.drawit.drawit.entity.GuestPlayer;
import com.drawit.drawit.entity.RoundHistory;
import com.drawit.drawit.enums.GameStatus;
import com.drawit.drawit.model.GameStateRedisModel;
import com.drawit.drawit.repository.GameRepository;
import com.drawit.drawit.repository.GuestPlayerRepository;
import com.drawit.drawit.repository.RoundHistoryRepository;
import com.drawit.drawit.repository.WordCacheRepository;
import com.drawit.drawit.util.GameCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.*;
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
    @Autowired
    private OCRService ocrService;
    @Autowired
    private GameWebSocketService webSocketService;
    @Autowired
    private RoundHistoryRepository roundHistoryRepository;

    /**
     * GET GAME LIST including active players
     *
     * @return list game
     */
    public GameListResponseDto getGameList(int page, int pageSize, String sort) {
        Sort sortBy = sort.equals("desc") ? Sort.by("createdAt").descending() : Sort.by("createdAt").ascending();
        Pageable pageable = PageRequest.of(page - 1, pageSize, sortBy);
        Page<Game> pageList = gameRepository.findAll(pageable);

        Long totalGame = gameRepository.count();

        List<GameListItemResponseDto> gameList = pageList.stream().map(game -> {
            int playerCount = guestPlayerRepository.countByGameAndIsActiveTrue(game).intValue();

            return GameListItemResponseDto.builder()
                    .gameCode(game.getGameCode())
                    .theme(game.getTheme())
                    .status(game.getStatus())
                    .playerCount(playerCount)
                    .createdAt(game.getCreatedAt())
                    .startedAt(game.getStartedAt())
                    .finishedAt(game.getFinishedAt())
                    .build();
        }).toList();

        return GameListResponseDto.builder().totalGame(totalGame).gameItemList(gameList).build();
    }

    /**
     *
     * @param request from FE form
     * @return information for displaying FE
     */
    @Transactional
    public GameResponseDto createGame(CreateGameRequestDto request) {
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
        game.setCreatedAt(LocalDateTime.now());

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
        game.setHostPlayerSessionId(host.getSessionId());
        game = gameRepository.save(game);

        // Generate words using HuggingFace (or default) quantity: max count x 2 + 2
        int wordCount = Math.max(request.getMaxRounds() * 2 + 2, 7);
        List<String> rawWords = huggingFaceService.getOrCreateKeywords(request.getTheme(), wordCount);
        // convert to WordStatusDto
        List<WordStatusDto> words = rawWords.stream()
                .map(w -> new WordStatusDto(w, 0, 0,
                        null,
                        null))
                .collect(Collectors.toList());

        // Cache in Redis : first initiate
        GameStateRedisModel redisState = GameStateRedisModel.builder()
                .gameId(game.getId())
                .gameCode(gameCode)
                .theme(game.getTheme())
                .status(GameStatus.WAITING)
                .maxRounds(game.getMaxRounds())
                .currentRound(0)
                .currentTurnNum(0)
                .drawingTime(game.getDrawingTime())
                .guessingTime(game.getGuessingTime())
                .words(words)
                .players(List.of(convertToPlayerDto(host)))
                .rounds(new ArrayList<>())
                .hostId(host.getId())
                .hostPlayerSessionId(host.getSessionId())
                .createdAt(game.getCreatedAt())
                .build();

        String redisKey = "game::" + gameCode;
        // store in redis 2h
        redisTemplate.opsForValue().set(redisKey, redisState, 240, TimeUnit.HOURS);

        log.info("Game id: {} , code: {}", game.getId(), gameCode);

        // action
        String action = "wait";
        // Build response
        return GameResponseDto.builder().
                gameId(game.getId())
                .gameCode(gameCode)
                .playerSessionId(host.getSessionId())
                .status(GameStatus.WAITING)
                .theme(game.getTheme())
                .maxRounds(game.getMaxRounds())
                .currentRound(0)
                .currentTurnNumber(0)
                .drawingTime(game.getDrawingTime())
                .guessingTime(game.getGuessingTime())
                .isHost(true)
                .words(rawWords)
                .players(List.of(convertToPlayerDto(host)))
                .action("wait")
                .build();
    }

    /**
     * join game, or re join
     *
     * @param request name, code
     * @return game response
     */
    @Transactional
    public GameResponseDto joinGame(JoinGameRequestDto request) {
        // 1. Find game
        Game game = gameRepository.findByGameCode(request.getGameCode()).orElseThrow(() -> new RuntimeException("Game not found: " + request.getGameCode()));

        // 2. status must be waiting
        if (game.getStatus() != GameStatus.WAITING) {
            throw new RuntimeException("Game already started or finished");
        }

        // get redis
        String redisKey = "game::" + request.getGameCode();

        GameStateRedisModel redisState = getGameStateFromRedis(redisKey);

        Optional<GuestPlayer> checkPlayer = guestPlayerRepository.findByGameAndIsActiveTrueAndNickname(game, request.getNickname());

        GuestPlayer player = null;
        if (checkPlayer.isEmpty()) {
            // 3. Check max players 2
            long currentPlayers = guestPlayerRepository.countByGameAndIsActiveTrue(game);
            if (currentPlayers >= 2) {
                throw new RuntimeException("Game is full (max 2 players for VERSUS mode)");
            }

            // 4. Create new player
            player = new GuestPlayer();
            player.setNickname(request.getNickname());
            player.setGame(game);
            player.setIsHost(false);
            player.setJoinedOrder((int) currentPlayers);
            player = guestPlayerRepository.save(player);

            // 5. Update Redis state


            // TODO reconstruct, no saving word into db
            if (redisState == null) {
                // Reconstruct from DB if missing
                redisState = reconstructRedisState(game);
            }

            // Add player to redis
            PlayerDto newPlayerDto = convertToPlayerDto(player);
            redisState.getPlayers().add(newPlayerDto);
            redisTemplate.opsForValue().set(redisKey, redisState, 240, TimeUnit.HOURS);


            log.info("Player {} joined game {}", player.getNickname(), request.getGameCode());
        } else {
            player = checkPlayer.get();

            // TODO reconstruct, no saving word into db
            if (redisState == null) {
                // Reconstruct from DB if missing
                redisState = reconstructRedisState(game);
            }

            log.info("Player {} rejoined game {}", request.getNickname(), request.getGameCode());
        }


        // get words
        List<String> availableWords = redisState.getWords().stream()
                .map(WordStatusDto::getWord)
                .collect(Collectors.toList());

        // TODO Broadcast player joined via WebSocket
//        webSocketService.broadcastPlayerJoined(request.getGameCode(), newPlayerDto);
        // Return response
        return GameResponseDto.builder()
                .gameId(game.getId())
                .gameCode(game.getGameCode())
                .playerSessionId(player.getSessionId()) // 2nd player
                .status(game.getStatus())
                .theme(game.getTheme())
                .maxRounds(game.getMaxRounds())
                .currentRound(redisState.getCurrentRound())
                .currentTurnNumber(redisState.getCurrentTurnNum()) // join current round and current turn = 0, increase next turn
                .drawingTime(game.getDrawingTime())
                .guessingTime(game.getGuessingTime())
                .isHost(false)
                .words(availableWords)
                .players(redisState.getPlayers())
                .action("wait")
                .build();
    }


    /**
     * SPECTATE GAME, guest
     *
     * @param gameCode game code
     * @return game info
     */
    public SpectateGameResponseDto spectateGame(String gameCode) {
        // Try Redis first
        String redisKey = "game::" + gameCode;
        GameStateRedisModel redisState = getGameStateFromRedis(redisKey);

        // TODO get game from DB when redis is expired
        if (redisState == null) {
            // Fallback to DB
            Game game = gameRepository.findByGameCode(gameCode).orElseThrow(() -> new RuntimeException("Game not found"));
            redisState = reconstructRedisState(game);
        }

        // Build spectator Dto
        List<SpectateGameRoundDto> allRounds = redisState.getRounds();

        return SpectateGameResponseDto.builder()
                // information of the game
                .gameCode(redisState.getGameCode())
                .theme(redisState.getTheme())
                .status(redisState.getStatus())
                .currentRoundNumber(redisState.getCurrentRound())
                .currentTurnNumber(redisState.getCurrentTurnNum())
                .maxRounds(redisState.getMaxRounds())
                .createdAt(redisState.getCreatedAt())
                .startedAt(redisState.getStartedAt())
                .finishedAt(redisState.getFinishedAt())
                // players
                .playersInGame(redisState.getPlayers())
                // display all rounds
                .allRounds(allRounds)
                .build();
    }


    /**
     * GET GAME (for player) for re-joining game
     *
     * @param gameCode game code from path
     * @param body     information of the player
     * @return information of a game
     */
    public GameResponseDto getGame(String gameCode, GetGameRequestDto body) {
        String playerSessionId = body.getPlayerSessionId();
        if (playerSessionId == null) {
            throw new RuntimeException("No session found. Please join the game first.");
        }

        // Get from Redis
        String redisKey = "game::" + gameCode;
        GameStateRedisModel redisState = getGameStateFromRedis(redisKey);

        // TODO reconstruct from DB, update later
        if (redisState == null) {
            Game game = gameRepository.findByGameCode(gameCode).orElseThrow(() -> new RuntimeException("Game not found"));
            redisState = reconstructRedisState(game);
        }

        // Find player
        Optional<PlayerDto> currentPlayer = redisState.getPlayers().stream()
                .filter(p -> p.getPlayerSessionId().equals(playerSessionId))
                .findFirst();

        if (currentPlayer.isEmpty()) {
            throw new RuntimeException("You are not in this game");
        }

        // get action
        String action = getActionPlayer(redisState, playerSessionId);

        // get latest drawing data
        String latestDrawingData = getDrawingDataByAction(redisState, action);

        // Return available words redis
        List<String> availableWords = getAvailWordsByAction(redisState, action);

        return GameResponseDto.builder()
                .gameId(redisState.getGameId())
                .gameCode(redisState.getGameCode())
                .playerSessionId(playerSessionId) // player session id of requester
                .isHost(currentPlayer.get().getIsHost())
                .status(redisState.getStatus())
                .theme(redisState.getTheme())
                .maxRounds(redisState.getMaxRounds())
                .currentRound(redisState.getCurrentRound())
                .currentTurnNumber(redisState.getCurrentTurnNum())
                .drawingTime(redisState.getDrawingTime())
                .guessingTime(redisState.getGuessingTime())

                .words(availableWords)
                .players(redisState.getPlayers())

                .currentDrawerSessionId(redisState.getCurrentDrawerSessionId()) // TODO consider to update later
                .action(action)
                .guessingImageData(latestDrawingData)
                .build();
    }

    /**
     * Start a game
     *
     * @param gameCode from path
     * @param body     information of host player
     * @return game room information
     */
    @Transactional
    public GameResponseDto startGame(String gameCode, StartGameRequestDto body) {

        String playerSessionId = body.getPlayerSessionId();
        if (playerSessionId == null) {
            throw new RuntimeException("No session found");
        }

        // Get game from DB
        Game game = gameRepository.findByGameCode(gameCode).orElseThrow(() -> new RuntimeException("Game not found"));

        // Check status
        if (game.getStatus() != GameStatus.WAITING) {
            throw new RuntimeException("Game already started or finished");
        }

        // Check if requester is host
        GuestPlayer requester = guestPlayerRepository.findBySessionId(playerSessionId).orElseThrow(() -> new RuntimeException("Player not found"));

        if (!requester.getIsHost()) {
            throw new RuntimeException("Only host can start the game");
        }

        // Check minimum players (2 for VERSUS mode)
        long playerCount = guestPlayerRepository.countByGameAndIsActiveTrue(game);
        if (playerCount < 2) {
            throw new RuntimeException("Need at least 2 players to start");
        }

        // Update game status
        game.setStatus(GameStatus.IN_PROGRESS);
        game.setStartedAt(LocalDateTime.now());
        game.setCurrentRound(game.getCurrentRound() + 1); // round = 1
        gameRepository.save(game);

        // Get Redis state
        String redisKey = "game::" + gameCode;
        GameStateRedisModel redisState = getGameStateFromRedis(redisKey);

        if (redisState == null) {
            redisState = reconstructRedisState(game);
        }

        // RANDOM first drawer
        Random random = new Random();
        List<PlayerDto> players = redisState.getPlayers();
        int randomIndex = random.nextInt(players.size());

        // swap random player to first
        Collections.swap(players, 0, randomIndex);
        redisState.setPlayers(players);


        PlayerDto firstDrawer = players.get(0);

        // Update state
        redisState.setStatus(GameStatus.IN_PROGRESS);
        redisState.setCurrentRound(redisState.getCurrentRound() + 1); // round = 1
        redisState.setCurrentTurnNum(redisState.getCurrentTurnNum() + 1); //  turn 1 :  drawing, turn 2: guessing
        redisState.setCurrentDrawerSessionId(firstDrawer.getPlayerSessionId()); // TODO update drawer and guesser
        redisState.setStartedAt(game.getStartedAt());

        // Initialize first round, round have the same attribute to spectator
        SpectateGameRoundDto firstRound = SpectateGameRoundDto.builder()
                .roundNumber(redisState.getCurrentRound())
                .turnNumber(redisState.getCurrentTurnNum())
                .drawerNickname(firstDrawer.getNickname())
                .drawerPlayerSessionId(firstDrawer.getPlayerSessionId())
                .selectedWord(null) // Not selected yet
                .drawingData(null)
                .containingText(null)
                .guesses(new ArrayList<>()).build();

        redisState.getRounds().add(firstRound);

        // Save to Redis
        redisTemplate.opsForValue().set(redisKey, redisState, 240, TimeUnit.HOURS);

        log.info("Game {} started. First drawer: {} , player sessionid: {}", gameCode, firstRound.getDrawerNickname(), firstDrawer.getPlayerSessionId());

        // Return word into response
        List<String> availableWords = redisState.getWords().stream()
                .map(WordStatusDto::getWord)
                .collect(Collectors.toList());

        // TODO : Websocket Broadcast game started
//        GameStateMessageDto stateMessage = GameStateMessageDto.builder().type("GAME_STARTED")
//                .gameCode(gameCode)
//                .currentRound(1)
//                .maxRounds(redisState.getMaxRounds())
//                .currentDrawer(firstDrawer.getNickname())
//                .status(GameStatus.IN_PROGRESS)
//                .build();
//
//        webSocketService.broadcastGameState(gameCode, stateMessage);
        // set action, session ids are equal, draw
        String action = body.getPlayerSessionId().equals(firstDrawer.getPlayerSessionId()) ? "draw" : "wait";
        return GameResponseDto.builder()
                .gameId(game.getId())
                .gameCode(gameCode)
                .playerSessionId(playerSessionId)
                .status(GameStatus.IN_PROGRESS)
                .theme(game.getTheme())
                .maxRounds(game.getMaxRounds())
                .currentRound(redisState.getCurrentRound())
                .currentTurnNumber(redisState.getCurrentTurnNum())
                .drawingTime(game.getDrawingTime())
                .guessingTime(game.getGuessingTime())
                .isHost(true)
                .words(availableWords)
                .players(redisState.getPlayers())
                .currentDrawerSessionId(redisState.getCurrentDrawerSessionId()) // TODO consider to update drawer and guesser
                .action(action)
                .build();
    }

    /**
     * submit drawing
     *
     * @param gameCode from path
     * @param request  information of user and drawing data
     * @return information after submit, score, containing text
     */
    @Transactional
    public SubmitDrawingResponseDto submitDrawing(String gameCode, SubmitDrawingRequestDto request) {
        if (request == null || request.getPlayerSessionId().isEmpty()) {
            throw new RuntimeException("No session found");
        }
        String playerSessionId = request.getPlayerSessionId();

        // Get Redis state
        String redisKey = "game::" + gameCode;
        GameStateRedisModel redisState = getGameStateFromRedis(redisKey);

        if (redisState == null) {
            // TODO get information again from db
            throw new RuntimeException("Game not found in cache");
        }

        // Check if game is in progress
        if (redisState.getStatus() != GameStatus.IN_PROGRESS) {
            throw new RuntimeException("Game is not in progress");
        }

        // Check if it's requester's turn
        if (!playerSessionId.equals(redisState.getCurrentDrawerSessionId())) {
            throw new RuntimeException("Not your turn to draw");
        }

        // check if is not in correct turn or round
        if (!Objects.equals(request.getTurnNumber(), redisState.getCurrentTurnNum()) || !Objects.equals(request.getRoundNumber(), redisState.getCurrentRound())) {
            throw new RuntimeException("Not correct round or turn");
        }

        // Check if word correct
        Optional<WordStatusDto> wordOpt = redisState.getWords().stream()
                .filter(w -> w.getWord().equalsIgnoreCase(request.getSelectedWord()))
                .findFirst();

        if (wordOpt.isEmpty()) {
            throw new RuntimeException("Invalid word selection");
        }

        WordStatusDto wordStatus = wordOpt.get();

        // OCR check for keyword text, call AI to check image
        String containingKeyword = ocrService.containingKeywordText(request.getDrawingData(), request.getSelectedWord());
        int penalty = ocrService.calculatePenalty(containingKeyword);

        // Find drawer player
        Optional<PlayerDto> drawerOpt = redisState.getPlayers().stream()
                .filter(p -> p.getPlayerSessionId().equals(playerSessionId))
                .findFirst();

        if (drawerOpt.isEmpty()) {
            throw new RuntimeException("Player not found");
        }

        PlayerDto drawer = drawerOpt.get();

        // Apply penalty if text detected
        if (penalty > 0) {
            drawer.setScore(Math.max(0, drawer.getScore() - penalty));
        }

        // Mark word as used
        wordStatus.setUsedInRound(redisState.getCurrentRound());
        wordStatus.setUsedInTurn(redisState.getCurrentTurnNum());
        wordStatus.setUsedByPlayerNickname(drawer.getNickname());
        wordStatus.setUsedByPlayerSessionId(drawer.getPlayerSessionId());

        // Update current round with drawing, submit at specific round number
        int currentRoundIndex = redisState.getRounds().size() - 1; // get a latest record
        // set value back to record in round
        SpectateGameRoundDto currentRound = redisState.getRounds().get(currentRoundIndex);
        currentRound.setSelectedWord(request.getSelectedWord());
        currentRound.setDrawingData(request.getDrawingData());
        currentRound.setContainingText(containingKeyword);
        currentRound.setDrawingTime(redisState.getDrawingTime() - request.getDrawingTimeLeft());
        currentRound.setPenaltyPoints(penalty);
        currentRound.setSubmitAt(LocalDateTime.now());

        // Save to Redis
        redisTemplate.opsForValue().set(redisKey, redisState, 240, TimeUnit.HOURS);

        // TODO update websocket Broadcast drawing to all players
//        DrawingSubmitMessageDto drawingMessage = DrawingSubmitMessageDto.builder()
//                .roundId(redisState.getCurrentRound())
//                .drawer(drawer.getNickname())
//                .drawingData(request.getDrawingData())
//                .containsText(containsKeyword)
//                .containsKeyword(containsKeyword)
//                .build();
//
//        webSocketService.broadcastDrawing(gameCode, drawingMessage);

        log.info("Drawing submitted by {} for word '{}'. Penalty: {}, in round {} in turn {}", drawer.getNickname(), request.getSelectedWord(), penalty, currentRound.getRoundNumber(), currentRound.getTurnNumber());

        return SubmitDrawingResponseDto.builder()
                .success(true)
                .containingKeyword(containingKeyword)
                .pointsPenalty(penalty)
                .build();
    }

    /**
     * player submits guessing word
     *
     * @param gameCode from path
     * @param request  body with guesses, time
     * @return response for FE
     */
    @Transactional
    public SubmitGuessResponseDto submitGuess(String gameCode, SubmitGuessRequestDto request) {
        if (request == null || request.getPlayerSessionId().isEmpty()) {
            throw new RuntimeException("No session found");
        }

        String playerSessionId = request.getPlayerSessionId();
        // Get Redis state
        String redisKey = "game::" + gameCode;
        GameStateRedisModel redisState = getGameStateFromRedis(redisKey);

        if (redisState == null) {
            throw new RuntimeException("Game not found");
        }

        // Check if it's NOT guesser's turn to draw, guesser
        if (playerSessionId.equals(redisState.getCurrentDrawerSessionId())) {
            throw new RuntimeException("You are the drawer, cannot guess");
        }
        // check if is not in correct turn or round
        if (!Objects.equals(request.getTurnNumber(), redisState.getCurrentTurnNum()) || !Objects.equals(request.getRoundNumber(), redisState.getCurrentRound())) {
            throw new RuntimeException("Not correct round or turn");
        }

        // Get current round
        int currentRoundIndex = redisState.getRounds().size() - 1;
        SpectateGameRoundDto currentRound = redisState.getRounds().get(currentRoundIndex);

        if (currentRound.getSelectedWord() == null) {
            throw new RuntimeException("Drawing not submitted yet");
        }

        // Check if player in game
        Optional<PlayerDto> guesserOpt = redisState.getPlayers().stream().filter(p -> p.getPlayerSessionId().equals(playerSessionId)).findFirst();

        if (guesserOpt.isEmpty()) {
            throw new RuntimeException("Player not found");
        }

        PlayerDto guesser = guesserOpt.get();

        // guessed and correct
        boolean alreadyGuessed = currentRound.getGuesses().stream()
                .anyMatch(g -> g.getPlayerSessionId().equals(guesser.getPlayerSessionId()) && g.getIsCorrect());

        if (alreadyGuessed) {
            throw new RuntimeException("You already guessed this round");
        }

        // Check if guess is correct
        boolean isCorrect = request.getGuess().trim().equalsIgnoreCase(currentRound.getSelectedWord().trim());

        // Calculate points
        int pointsEarned = 0;

        if (isCorrect) {
            // Base points: Max = max time each guessing round
            // Bonus: guess sooner get more points

            pointsEarned = redisState.getGuessingTime() - (redisState.getGuessingTime() - request.getGuessingTimeLeft()); // Max = guessing time, min : 0
            // Update player score
            guesser.setScore(guesser.getScore() + pointsEarned);
        }

        // Add guess to round
        GuessDto guessDto = GuessDto.builder()
                .playerNickname(guesser.getNickname())
                .playerSessionId(guesser.getPlayerSessionId())
                .guessedWord(request.getGuess())
                .isCorrect(isCorrect)
                .pointsEarned(pointsEarned)
                .submittedAt(LocalDateTime.now())
                .build();

        currentRound.getGuesses().add(guessDto);

        // guess correct move to next step
        // or time out
        if (isCorrect || (request.getGuessingTimeLeft() <= 0)) {
            // save history to db
            saveRoundHistoryToDB(redisState, currentRound, gameCode);
            // handle turn
            handleTurnTransition(gameCode, redisState, playerSessionId);
        }

        // Save to Redis
        redisTemplate.opsForValue().set(redisKey, redisState, 240, TimeUnit.HOURS);

//        // TODO websocket Broadcast guess to all players
//        GuessSubmittedMessageDto guessMessage = GuessSubmittedMessageDto.builder()
//                .roundId(redisState.getCurrentRound())
//                .playerNickname(guesser.getNickname())
//                .guess(request.getGuess())
//                .isCorrect(isCorrect)
//                .pointsEarned(pointsEarned)
//                .build();
//
//
        log.info("Guess submitted by {}: '{}' - Correct: {}, Points: {}", guesser.getNickname(), request.getGuess(), isCorrect, pointsEarned);

        return SubmitGuessResponseDto.builder()
                .isCorrect(isCorrect)
                .pointsEarned(pointsEarned)
                .correctWord(isCorrect ? null : currentRound.getSelectedWord()) // Show answer if wrong
                .build();
    }

    /**
     * get Available words by action from redis
     *
     * @param redisState redis state
     * @return action guess : return data
     */
    private List<String> getAvailWordsByAction(GameStateRedisModel redisState, String action) {
        if (!action.equals("draw")) {
            return new ArrayList<>();
        }
        return redisState.getWords().stream()
                .map(WordStatusDto::getWord)
                .collect(Collectors.toList());
    }

    /**
     * get latest drawing data by action from redis
     *
     * @param redisState redis state
     * @return action guess : return data
     */
    private String getDrawingDataByAction(GameStateRedisModel redisState, String action) {
        if (!action.equals("guess")) {
            return null;
        }
        List<SpectateGameRoundDto> spectateGameRoundDtoLst = redisState.getRounds();
        // round not create
        if (spectateGameRoundDtoLst.isEmpty()) {
            return null;
        }

        SpectateGameRoundDto currentRound = spectateGameRoundDtoLst.get(redisState.getRounds().size() - 1);

        return currentRound.getDrawingData();
    }

    /**
     * return action of player to draw or to guess
     *
     * @param redisState redis model
     * @return draw, wait, guess
     */
    private String getActionPlayer(GameStateRedisModel redisState, String playerSessionId) {

        List<SpectateGameRoundDto> spectateGameRoundDtoLst = redisState.getRounds();
        // round not create
        if (spectateGameRoundDtoLst.isEmpty()) {
            return "wait";
        }

        SpectateGameRoundDto currentRound = redisState.getRounds().get(redisState.getRounds().size() - 1);
        // requester = drawer
        if (playerSessionId.equals(currentRound.getDrawerPlayerSessionId())) {
            // not submit = draw
            if (currentRound.getSubmitAt() == null) {
                return "draw";
            }
            // submitted > guesser is guessing
            return "wait";
        }

        // requester = guesser
        if (currentRound.getSubmitAt() == null) {
            // not submit = wait drawer finishing
            return "wait";
        }
        // submitted -> guesser starts guessing
        return "guess";
    }

    /**
     * get data from redis by game code
     *
     * @param redisKey input
     * @return GameStateRedisModel
     */
    private GameStateRedisModel getGameStateFromRedis(String redisKey) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.convertValue(redisTemplate.opsForValue().get(redisKey), GameStateRedisModel.class);
        } catch (Exception e) {
            log.error("Failed to get from Redis: {}", e.getMessage());
            return null;
        }
    }


    /**
     * handle moving to next turn, next round or end game
     *
     * @param gameCode        game code from path
     * @param redisState      redis model
     * @param playerSessionId player session id submit
     */
    private void handleTurnTransition(String gameCode, GameStateRedisModel redisState, String playerSessionId) {
        int totalPlayers = redisState.getPlayers().size(); // 2 players
        int currentTurnNum = redisState.getCurrentTurnNum(); // = 1 : A draw B guess ;  or 2 : B draw A guess

        // if turn = 1, move to next turn
        if (currentTurnNum == 1) {
            int nextTurnNum = currentTurnNum + 1; // 1 transfer to 2
            redisState.setCurrentTurnNum(nextTurnNum);

            // get next drawer
            PlayerDto nextDrawer = redisState.getPlayers().get(nextTurnNum - 1); // nextTurnNum now = 2. get index = 1
            redisState.setCurrentDrawerSessionId(nextDrawer.getPlayerSessionId());

            SpectateGameRoundDto nextRoundDto = SpectateGameRoundDto.builder()
                    .roundNumber(redisState.getCurrentRound())
                    .turnNumber(nextTurnNum)
                    .drawerNickname(nextDrawer.getNickname())
                    .drawerPlayerSessionId(nextDrawer.getPlayerSessionId())
                    .guesses(new ArrayList<>())
                    .containingText(null)
                    .build();

            redisState.getRounds().add(nextRoundDto);
            return;
        }

        // turn == 2 , check current round = max round, finish game
        if (Objects.equals(redisState.getCurrentRound(), redisState.getMaxRounds())) {
            finishGame(gameCode, redisState);
            return;
        }

        // turn == 2, current round < max round, move to next round, reset turn back to 1
        int nextRoundNumber = redisState.getCurrentRound() + 1;

        redisState.setCurrentRound(nextRoundNumber);
        redisState.setCurrentTurnNum(1);
        PlayerDto firstPlayer = redisState.getPlayers().get(0); // back to first player
        redisState.setCurrentDrawerSessionId(firstPlayer.getPlayerSessionId());

        SpectateGameRoundDto nextRoundDto = SpectateGameRoundDto.builder()
                .roundNumber(nextRoundNumber)
                .turnNumber(redisState.getCurrentTurnNum())
                .drawerNickname(firstPlayer.getNickname())
                .drawerPlayerSessionId(firstPlayer.getPlayerSessionId())
                .guesses(new ArrayList<>())
                .containingText(null)
                .build();

        redisState.getRounds().add(nextRoundDto);
    }

    /**
     * Finish game and save to db
     *
     * @param gameCode   include game code
     * @param redisState redis with all information of rounds
     */
    private void finishGame(String gameCode, GameStateRedisModel redisState) {

        // Update DB
        Game game = gameRepository.findByGameCode(gameCode).orElseThrow(() -> new RuntimeException("Game not found"));

        game.setStatus(GameStatus.FINISHED);
        game.setFinishedAt(LocalDateTime.now());
        gameRepository.save(game);

        // set redis's field

        redisState.setStatus(GameStatus.FINISHED);
        redisState.setFinishedAt(game.getFinishedAt());

        // Update player scores in DB
        for (PlayerDto player : redisState.getPlayers()) {
            GuestPlayer dbPlayer = guestPlayerRepository.findBySessionId(player.getPlayerSessionId()).orElse(null);

            if (dbPlayer != null) {
                dbPlayer.setScore(player.getScore());
                guestPlayerRepository.save(dbPlayer);
            }
        }

        // TODO websocket Broadcast game finished
//        GameStateMessageDto finishedMessage = GameStateMessageDto.builder()
//                .type("GAME_FINISHED")
//                .gameCode(gameCode)
//                .currentRound(redisState.getCurrentRound())
//                .maxRounds(redisState.getMaxRounds())
//                .status(GameStatus.FINISHED).build();
//
//        webSocketService.broadcastGameState(gameCode, finishedMessage);

        log.info("Game {} finished", gameCode);
    }

    /**
     * Save Round History to DB
     *
     * @param state    redis model
     * @param roundDto a round
     * @param gameCode game code to save
     */
    private void saveRoundHistoryToDB(GameStateRedisModel state, SpectateGameRoundDto roundDto, String gameCode) {
        Game game = gameRepository.findByGameCode(gameCode).orElse(null);
        if (game == null) return;


        GuessDto winningGuess = roundDto.getGuesses().stream()
                .filter(GuessDto::getIsCorrect)
                .findFirst()
                .orElse(null); //

        int turnNum = state.getCurrentTurnNum(); // 1: drawing, 2: guessing

        RoundHistory history = RoundHistory.builder()
                .game(game)
                .roundNumber(roundDto.getRoundNumber())
                .turnNumber(turnNum)
                .wordSelected(roundDto.getSelectedWord())
                .drawerPlayerSessionId(roundDto.getDrawerPlayerSessionId())
                .drawerPlayerNickname(roundDto.getDrawerNickname())
                .drawingData(roundDto.getDrawingData())
                .drawingContainingText(roundDto.getContainingText())
                .penaltyPoints(roundDto.getPenaltyPoints())
                .createdAt(LocalDateTime.now())
                .build();

        if (winningGuess != null) {
            history.setGuesserPlayerNickname(winningGuess.getPlayerNickname());
            history.setGuesserPlayerSessionId(winningGuess.getPlayerSessionId());
            history.setFinalGuess(winningGuess.getGuessedWord());
            history.setIsCorrect(true);
            history.setPointsEarned(winningGuess.getPointsEarned());
            history.setPenaltyPoints(0); // TODO update penalty points later
        } else {
            history.setIsCorrect(false);
            history.setPointsEarned(0);
        }

        roundHistoryRepository.save(history);
    }

    private PlayerDto convertToPlayerDto(GuestPlayer player) {
        return new PlayerDto(player.getNickname(), player.getScore(), player.getIsHost(), player.getSessionId(), player.getJoinedOrder());
    }

    /**
     * TODO
     * get information from db to reconstruct
     *
     * @param game game dto
     * @return new redis object
     */
    private GameStateRedisModel reconstructRedisState(Game game) {
        List<GuestPlayer> players = guestPlayerRepository.findByGameAndIsActiveTrueOrderByJoinedOrderAsc(game);
        List<PlayerDto> playerDtos = players.stream().map(this::convertToPlayerDto).collect(Collectors.toList());

        // Reconstruct words
        List<String> rawWords = huggingFaceService.getOrCreateKeywords(game.getTheme(), game.getMaxRounds() + 3);
        List<WordStatusDto> words = rawWords.stream()
                .map(w -> new WordStatusDto(w, 0, 0, null, null))
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
                .players(playerDtos)
                .rounds(new ArrayList<>()) // TODO, next save round in db or accept replay each rounds
                .hostId(game.getHostId())
                .hostPlayerSessionId(game.getHostPlayerSessionId()) // TODO, next session id of player
                .createdAt(game.getCreatedAt())
                .startedAt(game.getStartedAt())
                .finishedAt(game.getFinishedAt())
                .build();
    }
}