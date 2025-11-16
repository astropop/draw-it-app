// app/components/JoinGameForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  Typography,
  Divider,
} from "@mui/material";
import { z, ZodError } from "zod";
import { gameApi } from "@/app/lib/api";

// Validation schema
const joinGameSchema = z.object({
  gameCode: z
    .string()
    .min(8, "Game code must be 8 characters")
    .max(8, "Game code must be 8 characters")
    .regex(/^[A-Z0-9]+$/, "Game code must contain only letters and numbers"),
  nickname: z
    .string()
    .min(1, "Nickname is required")
    .max(50, "Nickname is too long"),
});

type JoinGameInput = z.infer<typeof joinGameSchema>;

export default function JoinGameForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<JoinGameInput>({
    gameCode: "",
    nickname: "",
  });

  const handleChange =
    (field: keyof JoinGameInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "gameCode"
          ? event.target.value.toUpperCase()
          : event.target.value;

      setFormData({
        ...formData,
        [field]: value,
      });
      setError(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate with Zod
      const validatedData = joinGameSchema.parse(formData);

      setLoading(true);

      // Call API
      const response = await gameApi.joinGame(validatedData);

      // Save to localStorage for rejoin
      localStorage.setItem("sessionId", response.sessionId);
      localStorage.setItem("gameCode", response.gameCode);
      localStorage.setItem("nickname", validatedData.nickname);
      localStorage.setItem("lastGame", response.gameCode);
      localStorage.setItem("lastNickname", validatedData.nickname);

      // Redirect to game room
      router.push(`/game/${response.gameCode}`);
    } catch (err) {
      setLoading(false);

      if (err instanceof ZodError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Failed to join game. Please check the game code and try again."
        );
      }
    }
  };

  const handlePasteGameCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim().toUpperCase();
      setFormData((prev) => ({ ...prev, gameCode: cleaned }));
    } catch (err) {
      console.error("Failed to read clipboard:", err);
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
        {/* Game Code Input */}
        <Box>
          <TextField
            label='Game Code'
            value={formData.gameCode}
            onChange={handleChange("gameCode")}
            required
            fullWidth
            placeholder='e.g., ABC12345'
            helperText='Enter the 8-character game code'
            inputProps={{
              maxLength: 8,
              style: {
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontSize: "1.2rem",
                fontWeight: "bold",
                textAlign: "center",
              },
            }}
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: "monospace",
              },
            }}
          />

          <Button
            variant='text'
            size='small'
            onClick={handlePasteGameCode}
            sx={{ mt: 1 }}
          >
            📋 Paste from clipboard
          </Button>
        </Box>

        <Divider />

        {/* Nickname Input */}
        <TextField
          label='Your Nickname'
          value={formData.nickname}
          onChange={handleChange("nickname")}
          required
          fullWidth
          placeholder='Enter your display name'
          helperText='This will be your name in the game'
          inputProps={{ maxLength: 50 }}
        />

        {/* Submit Button */}
        <Button
          type='submit'
          variant='contained'
          size='large'
          fullWidth
          disabled={loading || !formData.gameCode || !formData.nickname}
          sx={{ py: 1.5 }}
        >
          {loading ? "Joining Game..." : "Join Game"}
        </Button>

        <Divider>OR</Divider>

        {/* Navigation Buttons */}
        <Stack direction='row' spacing={2}>
          <Button
            variant='outlined'
            fullWidth
            onClick={() => router.push("/create")}
          >
            Create New Game
          </Button>
          <Button variant='outlined' fullWidth onClick={() => router.push("/")}>
            Browse Games
          </Button>
        </Stack>

        {/* Recent Games */}
        <RecentGames />
      </Stack>
    </Box>
  );
}

// Recent games component (bonus feature)
function RecentGames() {
  const router = useRouter();
  const [recentGame, setRecentGame] = useState<{
    code: string;
    nickname: string;
  } | null>(null);

  useEffect(() => {
    const lastGame = localStorage.getItem("lastGame");
    const lastNickname = localStorage.getItem("lastNickname");

    if (lastGame && lastNickname) {
      setRecentGame({ code: lastGame, nickname: lastNickname });
    }
  }, []);

  if (!recentGame) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant='caption' color='text.secondary'>
        Recent game:
      </Typography>
      <Box
        sx={{
          mt: 1,
          p: 2,
          bgcolor: "grey.100",
          borderRadius: 1,
          cursor: "pointer",
          "&:hover": { bgcolor: "grey.200" },
        }}
        onClick={() => router.push(`/game/${recentGame.code}`)}
      >
        <Typography variant='body2'>
          <strong>{recentGame.code}</strong> as <em>{recentGame.nickname}</em>
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Click to rejoin
        </Typography>
      </Box>
    </Box>
  );
}
