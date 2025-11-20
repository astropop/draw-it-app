package com.drawit.drawit.repository;


import com.drawit.drawit.entity.Game;
import com.drawit.drawit.enums.GameStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    Optional<Game> findByGameCode(String gameCode);
    boolean existsByGameCode(String gameCode);
    List<Game> findByStatusIn(List<GameStatus> statuses);
}