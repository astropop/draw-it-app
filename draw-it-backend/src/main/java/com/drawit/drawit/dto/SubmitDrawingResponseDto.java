package com.drawit.drawit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubmitDrawingResponseDto {
    private Boolean success;
    private Boolean containsKeyword;
    private String warning;
    private Integer pointsPenalty;
    private String nextDrawerSessionId;
}