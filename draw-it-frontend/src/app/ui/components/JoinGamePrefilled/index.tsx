// app/components/JoinGameFormPrefilled.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  Typography,
  Chip,
} from "@mui/material";
import { z, ZodError } from "zod";
import { gameApi } from "@/app/lib/api";

interface JoinGameFormPrefilledProps {
  gameCode: string;
}

const joinGameSchema = z.object({
  gameCode: z.string().length(8),
  nickname: z.string().min(1).max(50),
});

export default function JoinGameFormPrefilled({
  gameCode,
}: JoinGameFormPrefilledProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const validatedData = joinGameSchema.parse({ gameCode, nickname });
      setLoading(true);

      const response = await gameApi.joinGame(validatedData);

      localStorage.setItem("sessionId", response.sessionId);
      localStorage.setItem("gameCode", response.gameCode);
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("lastGame", response.gameCode);
      localStorage.setItem("lastNickname", nickname);

      router.push(`/game/${response.gameCode}`);
    } catch (err) {
      setLoading(false);

      if (err instanceof ZodError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to join game");
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
        {/* Game Code (read-only) */}
        <Box>
          <Typography variant='caption' color='text.secondary'>
            Game Code:
          </Typography>
          <Chip
            label={gameCode}
            color='primary'
            sx={{
              fontSize: "1.2rem",
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              mt: 1,
            }}
          />
        </Box>

        {/* Nickname Input */}
        <TextField
          label='Your Nickname'
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setError(null);
          }}
          required
          fullWidth
          autoFocus
          placeholder='Enter your display name'
          inputProps={{ maxLength: 50 }}
        />

        {/* Submit Button */}
        <Button
          type='submit'
          variant='contained'
          size='large'
          fullWidth
          disabled={loading || !nickname}
          sx={{ py: 1.5 }}
        >
          {loading ? "Joining..." : "Join Game"}
        </Button>

        <Button
          variant='outlined'
          fullWidth
          onClick={() => router.push("/join")}
        >
          Use Different Code
        </Button>
      </Stack>
    </Box>
  );
}
