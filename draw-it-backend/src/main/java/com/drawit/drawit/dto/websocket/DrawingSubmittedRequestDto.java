package com.drawit.drawit.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DrawingSubmittedRequestDto {
    private Integer roundId;
    private String drawer;
    private String drawingData; // base64 image
    private Boolean containsText;
    private Boolean containsKeyword;
}