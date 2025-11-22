package com.drawit.drawit.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * cache table stores all words
 */
@Entity
@Table(name = "word_cache")
@Data
public class WordCache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String theme;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "word_cache_words", joinColumns = @JoinColumn(name = "word_cache_id"))
    @Column(name = "word")
    private List<String> words;

    private LocalDateTime createdAt = LocalDateTime.now();
}