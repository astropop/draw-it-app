package com.drawit.drawit.service;

import com.drawit.drawit.dto.GameResponseDto;
import com.drawit.drawit.dto.PlayerDto;
import com.drawit.drawit.dto.WordStatusDto;
import com.drawit.drawit.dto.websocket.*;
import com.drawit.drawit.entity.GuestPlayer;
import com.drawit.drawit.enums.GameStatus;
import com.drawit.drawit.model.GameStateRedisModel;
import com.drawit.drawit.repository.GuestPlayerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private GuestPlayerRepository guestPlayerRepository;

    /**
     * Broadcast full player list
     * Topic: /topic/game/{gameCode}/players
     */
    public void broadcastPlayerList(String gameCode) {
        GameStateRedisModel redisState = getGameStateFromRedis("game::" + gameCode);

        if (redisState != null) {
            PlayerListUpdateDto message = PlayerListUpdateDto.builder()
                    .players(redisState.getPlayers())
                    .build();

            messagingTemplate.convertAndSend(
                    "/topic/game/" + gameCode + "/players",
                    message
            );

            log.info("Broadcast player list for game {}", gameCode);
        }
    }

    /**
     * Kick player
     * Topic: /topic/game/{gameCode}/players (all) + /user/queue/kick (kicked player)
     */
    public void kickPlayer(String gameCode, String kickerSessionId, String targetSessionId) {
        // Verify kicker is host
        Optional<GuestPlayer> kickerOpt = guestPlayerRepository.findBySessionId(kickerSessionId);
        if (kickerOpt.isEmpty() || !kickerOpt.get().getIsHost()) {
            log.warn("Non-host {} tried to kick player", kickerSessionId);
            return;
        }

        // Get target player
        Optional<GuestPlayer> targetOpt = guestPlayerRepository.findBySessionId(targetSessionId);
        if (targetOpt.isEmpty()) {
            log.warn("Target player {} not found", targetSessionId);
            return;
        }

        GuestPlayer target = targetOpt.get();
        target.setIsActive(false);
        guestPlayerRepository.save(target);

        // Update Redis
        GameStateRedisModel redisState = getGameStateFromRedis("game::" + gameCode);

        // remove user from redis
        if (redisState != null) {
            redisState.getPlayers().removeIf(p -> p.getSessionId().equals(targetSessionId));
            redisTemplate.opsForValue().set("game::" + gameCode, redisState);

        }

        // Send personal message to kicked player
        KickPlayerResponseDto kickResponse = KickPlayerResponseDto.builder()
                .kicked(true)
                .targetSessionId(targetSessionId)
                .reason("Kicked by host")
                .gameCode(gameCode)
                .build();

        messagingTemplate.convertAndSend(
                "/queue/kick",
                kickResponse
        );

        // Broadcast updated player list
        broadcastPlayerList(gameCode);

        log.info("Player {} kicked from game {} by host", target.getNickname(), gameCode);
    }

    /**
     * Broadcast drawing submitted
     * Topic: /topic/game/{gameCode}/drawing
     */
    public void broadcastDrawing(String gameCode, DrawingSubmittedRequestDto message) {
        messagingTemplate.convertAndSend(
                "/topic/game/" + gameCode + "/drawing",
                message
        );

        log.info("Broadcast drawing in game {} by {}", gameCode, message.getDrawer());
    }

//    public void handleGuessSubmitted(String gameCode, String guesserSessionId, GuessSubmittedRequestDto request) {
//        // Process guess logic (check correct, update score)
//        // ... (integrate with GameService.submitGuess logic)
//
//        // Broadcast guess to all players
//        GuessSubmittedMessageDto message = GuessSubmittedMessageDto.builder()
//                .roundId(request.getRoundNo())
//                .playerNickname(getPlayerNickname(guesserSessionId))
//                .guess(request.getGuess())
//                .isCorrect(checkCorrect(gameCode, request))
//                .pointsEarned(calculatePoints(gameCode, request))
//                .build();
//
//        broadcastGuess(gameCode, message);
//    }
    /**
     * Broadcast guess submitted
     * Topic: /topic/game/{gameCode}/guess
     */
    public void broadcastGuess(String gameCode, GuessSubmittedMessageDto message) {
        messagingTemplate.convertAndSend(
                "/topic/game/" + gameCode + "/guess",
                message
        );

        log.info("Broadcast guess in game {}: {} guessed '{}'",
                gameCode, message.getPlayerNickname(), message.getGuess());
    }

//    /**
//     * Broadcast game state change
//     * Topic: /topic/game/{gameCode}/state
//     */
//    public void broadcastGameState(String gameCode, GameStateMessageDto message) {
//        messagingTemplate.convertAndSend(
//                "/topic/game/" + gameCode + "/state",
//                message
//        );
//
//        log.info("Broadcast game state: {} for game {}", message.getType(), gameCode);
//    }

    /**
     * get data from redis by gamecode
     * @param redisKey
     * @return
     */
    private GameStateRedisModel getGameStateFromRedis(String redisKey) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.convertValue( redisTemplate.opsForValue().get(redisKey), GameStateRedisModel.class);
        } catch (Exception e) {
            log.error("Failed to get from Redis: {}", e.getMessage());
            return null;
        }
    }
}