// app/components/JoinGameForm.tsx
"use client";

import { gameApi } from "@/app/lib/api";
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function JoinGameForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JoinGameInput>({
    // validate by zod
    resolver: zodResolver(joinGameSchema),
    defaultValues: {
      gameCode: "",
      nickname: "",
    },
  });

  // get value in real time
  // const formValues = watch();

  const onSubmit = async (data: JoinGameInput) => {
    try {
      // Call API
      const response = await gameApi.joinGame(data);

      // Save to localStorage for rejoin
      localStorage.setItem("sessionId", response.sessionId);
      localStorage.setItem("gameCode", response.gameCode);
      localStorage.setItem("nickname", data.nickname);
      localStorage.setItem("lastGame", response.gameCode);
      localStorage.setItem("lastNickname", data.nickname);

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
      console.error("Failed to read clipboard:", err);
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
                maxLength: 8,
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
          slotProps={{ htmlInput: { maxLength: 50 } }}
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
          disabled={isSubmitting}
          sx={{ py: 1.5 }}
        >
          {isSubmitting ? "Joining Game..." : "Join Game"}
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
      </Stack>
    </Box>
  );
}
