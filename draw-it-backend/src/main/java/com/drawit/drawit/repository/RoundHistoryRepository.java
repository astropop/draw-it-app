package com.drawit.drawit.repository;

import com.drawit.drawit.entity.RoundHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoundHistoryRepository extends JpaRepository<RoundHistory, Long> {
    List<RoundHistory> findByGameId(Long gameId);

    @Query(value = "select r from RoundHistory r join Games g on r.game_id = g.id where g.game_code = :gameCode", nativeQuery = true)
    Optional<RoundHistory> findRoundHistoryByGameCode(@Param("gameCode") String gameCode);
}