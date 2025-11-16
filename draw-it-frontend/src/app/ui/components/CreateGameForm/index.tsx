// app/components/CreateGameForm.tsx
"use client";

import { gameApi } from "@/app/lib/api";
import { CreateGameInput, createGameSchema } from "@/app/lib/validation";
import { GameMode } from "@/app/types/game.type";
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ZodError } from "zod";
import CreateGameSummary from "./_components/CreateGameSummary";

export default function CreateGameForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateGameInput>({
    hostNickname: "",
    theme: "",
    // language: "English",
    maxRounds: 3,
    drawingTime: 120,
    guessingTime: 60,
    gameMode: GameMode.VERSUS,
    // turnMode: TurnMode.SEQUENTIAL,
  });

  const handleChange = (field: keyof CreateGameInput) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setError(null);
  };

  const handleSliderChange =
    (field: "maxRounds" | "drawingTime" | "guessingTime") =>
    (event: Event, value: number | number[]) => {
      setFormData({
        ...formData,
        [field]: value as number,
      });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate with Zod
      const validatedData = createGameSchema.parse(formData);

      setLoading(true);

      // Call API
      const response = await gameApi.createGame(validatedData);

      // Save to localStorage for rejoin
      localStorage.setItem("sessionId", response.sessionId);
      localStorage.setItem("gameCode", response.gameCode);
      localStorage.setItem("nickname", validatedData.hostNickname);
      localStorage.setItem("lastGame", response.gameCode);
      localStorage.setItem("lastNickname", validatedData.hostNickname);

      // Redirect to game room
      router.push(`/game/${response.gameCode}`);
    } catch (err: any) {
      setLoading(false);
      if (err instanceof ZodError) {
        setError(err.message);
      } else {
        setError(err.message || "Failed to create game. Please try again.");
      }
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit}>
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Host Nickname */}
        <TextField
          label='Your Nickname'
          value={formData.hostNickname}
          onChange={handleChange("hostNickname")}
          required
          fullWidth
          helperText='This will be your display name in the game'
          slotProps={{ htmlInput: { maxLength: 50 } }}
        />

        <Divider />

        {/* Theme */}
        <TextField
          label='Game Theme'
          value={formData.theme}
          onChange={handleChange("theme")}
          required
          fullWidth
          placeholder='e.g., Animals, Food, Movies, Sports'
          helperText='AI will generate 5 words related to this theme'
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />
        <Divider />

        {/* Game Mode */}
        <FormControl fullWidth>
          <InputLabel>Game Mode</InputLabel>
          <Select
            value={formData.gameMode}
            label='Game Mode'
            onChange={handleChange("gameMode")}
          >
            <MenuItem value={GameMode.VERSUS} selected>
              Versus (1v1 head-to-head)
            </MenuItem>
          </Select>
        </FormControl>

        <Divider />

        {/* Max Rounds */}
        <Box>
          <Typography gutterBottom>
            Number of Rounds: {formData.maxRounds}
          </Typography>
          <Slider
            value={formData.maxRounds}
            onChange={handleSliderChange("maxRounds")}
            min={1}
            max={5}
            marks
            step={1}
            valueLabelDisplay='auto'
          />
          <Typography variant='caption' color='text.secondary'>
            Each player will draw {formData.maxRounds} time(s)
          </Typography>
        </Box>

        {/* Drawing Time */}
        <Box>
          <Typography gutterBottom>
            Drawing Time: {formData.drawingTime} seconds
          </Typography>
          <Slider
            value={formData.drawingTime}
            onChange={handleSliderChange("drawingTime")}
            min={30}
            max={300}
            step={10}
            valueLabelDisplay='auto'
            marks={[
              { value: 30, label: "30s" },
              { value: 120, label: "2m" },
              { value: 300, label: "5m" },
            ]}
          />
        </Box>

        {/* Guessing Time */}
        <Box>
          <Typography gutterBottom>
            Guessing Time: {formData.guessingTime} seconds
          </Typography>
          <Slider
            value={formData.guessingTime}
            onChange={handleSliderChange("guessingTime")}
            min={30}
            max={180}
            step={10}
            valueLabelDisplay='auto'
            marks={[
              { value: 30, label: "30s" },
              { value: 90, label: "1.5m" },
              { value: 180, label: "3m" },
            ]}
          />
        </Box>

        <Divider />

        {/* Summary */}
        <CreateGameSummary props={formData} />

        {/* Submit Button */}
        <Button
          type='submit'
          variant='contained'
          size='large'
          fullWidth
          disabled={loading}
          sx={{ py: 1.5 }}
        >
          {loading ? "Creating Game..." : "Create Game"}
        </Button>

        <Button variant='outlined' fullWidth onClick={() => router.push("/")}>
          Back to Lobby
        </Button>
      </Stack>
    </Box>
  );
}
