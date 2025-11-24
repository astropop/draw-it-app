package com.drawit.drawit.controller;

import com.drawit.drawit.dto.websocket.DrawingSubmittedMessageDto;
import com.drawit.drawit.dto.websocket.KickPlayerRequestDto;
import com.drawit.drawit.service.GameWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Objects;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameWebSocketController {

    private final GameWebSocketService webSocketService;

    /**
     * Kick player from game
     * Client sends to: /app/game/{gameCode}/kick
     * Broadcast to: /topic/game/{gameCode}/players (all) + /user/queue/kick (kicked player)
     */
    @MessageMapping("/game/{gameCode}/kick")
    public void kickPlayer(
            @DestinationVariable String gameCode,
            @Payload KickPlayerRequestDto body,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        String playerSessionId = getCurrentSessionId(headerAccessor);
        String targetSessionId = body.getTargetSessionId();
        log.info("Host: {} kick player: {}", playerSessionId, targetSessionId);

        webSocketService.kickPlayer(gameCode, playerSessionId, targetSessionId);
    }

    /**
     * Notify drawing submitted
     * Client sends to: /app/game/{gameCode}/drawing-submitted
     * Broadcast to: /topic/game/{gameCode}/drawing
     */
    @MessageMapping("/game/{gameCode}/drawing-submitted")
    public void drawingSubmitted(
            @DestinationVariable String gameCode,
            @Payload DrawingSubmittedMessageDto message,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        String sessionId = getCurrentSessionId(headerAccessor);
        log.info("Drawing submitted by session {} in game {}", sessionId, gameCode);

        webSocketService.broadcastDrawing(gameCode, message);
    }

    /**
     * Get session ID from WebSocket header
     */
    private String getCurrentSessionId(SimpMessageHeaderAccessor headerAccessor) {
        // Get HTTP session from WebSocket headers
        return Objects.requireNonNull(headerAccessor.getFirstNativeHeader("x-player-session-id"));
    }
}