// app/components/CreateGameForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Typography,
  Grid,
  Divider,
} from "@mui/material";
import { z, ZodError } from "zod";
import { gameApi } from "@/app/lib/api";

// Validation schema
const createGameSchema = z.object({
  hostNickname: z.string().min(1, "Nickname is required").max(50, "Too long"),
  theme: z.string().min(1, "Theme is required").max(100, "Too long"),
  language: z.enum(["English", "Vietnamese", "Spanish", "French", "Japanese"]),
  maxRounds: z.number().min(1).max(5),
  drawingTime: z.number().min(30).max(300),
  guessingTime: z.number().min(30).max(180),
  gameMode: z.enum(["MULTIPLAYER", "VERSUS"]),
  turnMode: z.enum(["SEQUENTIAL", "RANDOM"]),
});

type CreateGameInput = z.infer<typeof createGameSchema>;

export default function CreateGameForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateGameInput>({
    hostNickname: "",
    theme: "",
    language: "English",
    maxRounds: 3,
    drawingTime: 120,
    guessingTime: 60,
    gameMode: "MULTIPLAYER",
    turnMode: "SEQUENTIAL",
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
          inputProps={{ maxLength: 50 }}
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
          inputProps={{ maxLength: 100 }}
        />

        {/* Language */}
        <FormControl fullWidth>
          <InputLabel>Language</InputLabel>
          <Select
            value={formData.language}
            label='Language'
            onChange={handleChange("language")}
          >
            <MenuItem value='English'>English</MenuItem>
            <MenuItem value='Vietnamese'>Vietnamese (Tiếng Việt)</MenuItem>
            <MenuItem value='Spanish'>Spanish (Español)</MenuItem>
            <MenuItem value='French'>French (Français)</MenuItem>
            <MenuItem value='Japanese'>Japanese (日本語)</MenuItem>
          </Select>
        </FormControl>

        <Divider />

        {/* Game Mode */}
        <FormControl fullWidth>
          <InputLabel>Game Mode</InputLabel>
          <Select
            value={formData.gameMode}
            label='Game Mode'
            onChange={handleChange("gameMode")}
          >
            <MenuItem value='MULTIPLAYER'>
              Multiplayer (2+ players take turns)
            </MenuItem>
            <MenuItem value='VERSUS'>Versus (1v1 head-to-head)</MenuItem>
          </Select>
        </FormControl>

        {/* Turn Mode */}
        <FormControl fullWidth>
          <InputLabel>Turn Order</InputLabel>
          <Select
            value={formData.turnMode}
            label='Turn Order'
            onChange={handleChange("turnMode")}
          >
            <MenuItem value='SEQUENTIAL'>
              Sequential (Players take turns in order)
            </MenuItem>
            <MenuItem value='RANDOM'>
              Random (Random player each round)
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
        <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
          <Typography variant='subtitle2' gutterBottom>
            Game Summary:
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Mode:
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant='body2'>
                {formData.gameMode === "MULTIPLAYER"
                  ? "Multiplayer"
                  : "1v1 Versus"}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Rounds:
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant='body2'>{formData.maxRounds}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant='body2' color='text.secondary'>
                Est. Duration:
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant='body2'>
                ~
                {Math.ceil(
                  ((formData.drawingTime + formData.guessingTime) *
                    formData.maxRounds) /
                    60
                )}{" "}
                minutes
              </Typography>
            </Grid>
          </Grid>
        </Box>

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

        <Button
          variant='outlined'
          fullWidth
          onClick={() => router.push("/lobby")}
        >
          Back to Lobby
        </Button>
      </Stack>
    </Box>
  );
}
