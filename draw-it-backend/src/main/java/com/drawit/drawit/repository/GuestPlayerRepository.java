package com.drawit.drawit.repository;

import com.drawit.drawit.entity.GuestPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuestPlayerRepository extends JpaRepository<GuestPlayer, Long> {
    Optional<GuestPlayer> findBySessionId(String sessionId);
}