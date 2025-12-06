package com.drawit.drawit.repository;

import com.drawit.drawit.entity.Game;
import com.drawit.drawit.entity.GameWord;
import com.drawit.drawit.entity.WordCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GameWordRepository extends JpaRepository<GameWord, Long> {
    List<GameWord> findByGame(Game game);
}
