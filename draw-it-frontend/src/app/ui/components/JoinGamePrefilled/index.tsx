// app/components/JoinGameFormPrefilled.tsx
"use client";

import { joinGame } from "@/app/lib/api/JoinGame/fetcher";
import {
  JoinGameFormPrefilledProps,
  JoinGamePrefilledInput,
  joinGamePrefilledSchema,
} from "@/app/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function JoinGameFormPrefilled({
  gameCode,
}: JoinGameFormPrefilledProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<JoinGamePrefilledInput>({
    resolver: zodResolver(joinGamePrefilledSchema),
    defaultValues: {
      gameCode,
      nickname: "",
    },
  });

  // get data in real time
  const formValues = watch();

  const onSubmit = async (data: JoinGamePrefilledInput) => {
    try {
      const response = await joinGame(data);

      localStorage.setItem("playerSessionId", response.playerSessionId);
      localStorage.setItem("gameCode", response.gameCode);
      localStorage.setItem("nickname", data.nickname);

      router.push(`/game/${response.gameCode}`);
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error ? error.message : "Failed to create game",
      });
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
        {/* Game Code (read-only) */}
        <Box>
          <Typography variant='caption' color='text.secondary'>
            Game Code:
          </Typography>
          <Chip
            {...register("gameCode")}
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
          {...register("nickname")}
          label='Your Nickname'
          error={!!errors.nickname}
          required
          fullWidth
          autoFocus
          placeholder='Enter your display name'
          slotProps={{ htmlInput: { maxLength: 50 } }}
        />
        {errors.nickname && (
          <Typography component='span' color='error'>
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
          {isSubmitting ? "Joining..." : "Join Game"}
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
