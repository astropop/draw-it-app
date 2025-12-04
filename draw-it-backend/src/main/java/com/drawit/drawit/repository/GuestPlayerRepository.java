package com.drawit.drawit.repository;

import com.drawit.drawit.entity.Game;
import com.drawit.drawit.entity.GuestPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuestPlayerRepository extends JpaRepository<GuestPlayer, Long> {
    Optional<GuestPlayer> findBySessionId(String sessionId);
    Long countByGameAndIsActiveTrue(Game game);
    List<GuestPlayer> findByGameAndIsActiveTrueOrderByJoinedOrderAsc(Game game);
    Optional<GuestPlayer> findByGameAndIsActiveTrueAndNickname(Game game, String nickname);
}