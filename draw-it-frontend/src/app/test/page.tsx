// app/game/test-scenarios/page.tsx (UPDATE)
"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Stack,
  Container,
  Typography,
  Paper,
  Chip,
  Box,
} from "@mui/material";
import {
  game1RoomAsHost,
  game1RoomAsPlayer,
  game2RoomWordSelection,
  game2RoomAsDrawer,
  game2RoomAsGuesser,
} from "../mock/mockdata.unified";
import { GameResponseDTO } from "../types/game.type";
import GameRoom from "../ui/components/GameRoom";

type ScenarioKey = "host" | "player" | "wordSelection" | "drawing" | "guessing";

const scenarios: Record<
  ScenarioKey,
  { data: GameResponseDTO; label: string; description: string }
> = {
  host: {
    data: game1RoomAsHost,
    label: "👑 Host - Waiting",
    description: "Chủ phòng có nút START, chờ người chơi",
  },
  player: {
    data: game1RoomAsPlayer,
    label: "👤 Player - Waiting",
    description: "Người chơi thường, chỉ đợi host bấm start",
  },
  wordSelection: {
    data: game2RoomWordSelection,
    label: "🎯 My Turn - Word Selection",
    description: "Lượt của tôi, đang chọn từ để vẽ",
  },
  drawing: {
    data: game2RoomAsDrawer,
    label: "🎨 My Turn - Drawing",
    description: "Lượt của tôi, có thể vẽ trên canvas",
  },
  guessing: {
    data: game2RoomAsGuesser,
    label: "🤔 Others Turn - Guessing",
    description: "Lượt người khác, tôi đang đoán",
  },
};

export default function TestScenariosPage() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>("host");
  const [key, setKey] = useState(0);

  // ✅ Setup localStorage when scenario changes
  const setupLocalStorage = (scenario: ScenarioKey) => {
    const data = scenarios[scenario].data;
    const player = data.players.find((p) => p.sessionId === data.sessionId);

    localStorage.setItem("sessionId", data.sessionId);
    localStorage.setItem("gameCode", data.gameCode);
    localStorage.setItem("nickname", player?.nickname || "TestUser");

    console.log("✅ localStorage setup:", {
      sessionId: data.sessionId,
      gameCode: data.gameCode,
      nickname: player?.nickname,
      isHost: data.isHost,
    });
  };

  useEffect(() => {
    setupLocalStorage(selectedScenario);
  }, [selectedScenario]);

  const handleScenarioChange = (scenario: ScenarioKey) => {
    setSelectedScenario(scenario);
    setupLocalStorage(scenario);
    setKey((prev) => prev + 1); // Force re-render
  };

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h4' gutterBottom>
          🧪 GameRoom Test Scenarios
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Test tất cả trạng thái của game room
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant='subtitle2' gutterBottom>
            Current Scenario:
          </Typography>
          <Chip
            label={scenarios[selectedScenario].label}
            color='primary'
            sx={{ mb: 2 }}
          />
          <Typography variant='body2' color='text.secondary'>
            {scenarios[selectedScenario].description}
          </Typography>
        </Box>

        <Stack
          direction='row'
          spacing={1}
          flexWrap='wrap'
          sx={{ mt: 3, gap: 1 }}
        >
          {Object.entries(scenarios).map(([key, scenario]) => (
            <Button
              key={key}
              variant={selectedScenario === key ? "contained" : "outlined"}
              onClick={() => handleScenarioChange(key as ScenarioKey)}
              size='small'
            >
              {scenario.label}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* ✅ Force re-render with key */}
      <GameRoom key={key} gameData={scenarios[selectedScenario].data} />
    </Container>
  );
}
