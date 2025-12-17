package com.drawit.drawit.repository;

import com.drawit.drawit.entity.RoundHistory;
import com.drawit.drawit.entity.RoundHistoryGuess;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoundHistoryGuessRepository extends JpaRepository<RoundHistoryGuess, Long> {
//    @Query(value = "select r from RoundHistoryGuess r where r.round_history_id = :gameCode", nativeQuery = true)
    List<RoundHistoryGuess> findByRoundHistoryInOrderByIdAsc(List<RoundHistory> roundHistoryIds);
}