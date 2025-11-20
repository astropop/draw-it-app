package com.drawit.drawit.controller;

import com.drawit.drawit.entity.WordCache;
import com.drawit.drawit.repository.WordCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/words")
@RequiredArgsConstructor
public class WordController {
    @Autowired
    private WordCacheRepository repo;

    @GetMapping("/{theme}")
    public List<String> getWords(@PathVariable String theme) {
        return repo.findByThemeIgnoreCase(theme)
                .map(WordCache::getWords)
                .orElse(List.of());
    }
}