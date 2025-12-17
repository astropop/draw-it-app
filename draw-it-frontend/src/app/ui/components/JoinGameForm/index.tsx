"use client";

import { joinGame } from "@/app/lib/api/JoinGame/fetcher";
import { JoinGameInput, joinGameSchema } from "@/app/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContentPasteGo } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function JoinGameForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    // watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, isLoading, isValidating },
  } = useForm<JoinGameInput>({
    // validate by zod
    resolver: zodResolver(joinGameSchema),
    defaultValues: {
      gameCode: "",
      nickname: "",
    },
  });

  const onSubmit = async (data: JoinGameInput) => {
    try {
      // Call API
      const response = await joinGame(data);

      if (!response || !response.gameCode) {
        setError("root", {
          message: "Failed to join game",
        });
      }
      // Save to localStorage
      localStorage.setItem("playerSessionId", response.playerSessionId);
      localStorage.setItem("gameCode", response.gameCode);
      localStorage.setItem("nickname", data.nickname);

      // Redirect to game room
      router.push(`/game/${response.gameCode}`);
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to join game. Please check the game code and try again.",
      });
    }
  };

  const handlePasteGameCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim();
      setValue("gameCode", cleaned);
    } catch (err) {
      alert("Failed to read clipboard");
    }
  };

  return (
    <Box component='form' onSubmit={handleSubmit(onSubmit)}>
      {errors.root && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {errors.root.message}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Game Code Input */}
        <Box>
          <TextField
            {...register("gameCode")}
            label='Game Code'
            required
            fullWidth
            error={!!errors.gameCode}
            placeholder='e.g., ABC12345'
            helperText='Enter the game code'
            slotProps={{
              htmlInput: {
                style: {
                  letterSpacing: "0.1em",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  textAlign: "center",
                },
              },
            }}
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: "monospace",
              },
            }}
          />
          {errors.gameCode && (
            <Typography component='span' color='error' display={"block"}>
              {errors.gameCode.message}
            </Typography>
          )}
          <Button
            variant='text'
            size='small'
            onClick={handlePasteGameCode}
            sx={{ mt: 1 }}
          >
            <ContentPasteGo /> Paste from clipboard
          </Button>
        </Box>

        <Divider />

        {/* Nickname Input */}
        <TextField
          {...register("nickname")}
          error={!!errors.nickname}
          label='Your Nickname'
          required
          fullWidth
          placeholder='Enter your display name'
          helperText='This will be your name in the game'
        />
        {errors.nickname && (
          <Typography component='span' color='error' display={"block"}>
            {errors.nickname.message}
          </Typography>
        )}
        {/* Submit Button */}
        <Button
          type='submit'
          variant='contained'
          size='large'
          fullWidth
          disabled={isSubmitting || isLoading || isValidating}
          sx={{ py: 1.5 }}
        >
          {isSubmitting || isLoading || isValidating
            ? "Joining Game..."
            : "Join Game"}
        </Button>

        <Divider>OR</Divider>

        {/* Navigation Buttons */}
        <Stack direction='row' spacing={2}>
          <Button
            variant='outlined'
            fullWidth
            component={Link}
            href='/create'
            target='_blank'
          >
            Create New Game
          </Button>
          <Button variant='outlined' fullWidth component={Link} href='/'>
            Back to Home
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
