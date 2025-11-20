package com.drawit.drawit.repository;

import com.drawit.drawit.entity.WordCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WordCacheRepository extends JpaRepository<WordCache, Long> {
    Optional<WordCache> findByThemeIgnoreCase(String theme);
}
