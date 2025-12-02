package com.drawit.drawit.dto.submitdrawing;

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
    private String containingKeyword;
    private Integer pointsPenalty;
    private String nextDrawerPlayerSessionId;
}