// app/components/CreateGameForm.tsx
"use client";

import { gameApi } from "@/app/lib/api";
import { CreateGameInput, createGameSchema } from "@/app/lib/validation";
import { GameMode } from "@/app/types/game.type";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useForm } from "react-hook-form";
import CreateGameSummary from "./_components/CreateGameSummary";

export default function CreateGameForm() {
  const router = useRouter();

  // Initialize react-hook-form with Zod resolver
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateGameInput>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      hostNickname: "",
      theme: "",
      maxRounds: 3,
      drawingTime: 120,
      guessingTime: 60,
      gameMode: GameMode.VERSUS,
    },
  });

  // get value in real time
  const formValues = watch();

  const onSubmit = async (data: CreateGameInput) => {
    console.log("obSubmit", data);

    try {
      // Call API
      const response = await gameApi.createGame(data);

      // Save to localStorage for rejoin
      localStorage.setItem("sessionId", response.sessionId);
      localStorage.setItem("gameCode", response.gameCode);
      localStorage.setItem("nickname", data.hostNickname);
      localStorage.setItem("lastGame", response.gameCode);
      localStorage.setItem("lastNickname", data.hostNickname);

      // Redirect to game room
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
        {/* Host Nickname */}
        <TextField
          {...register("hostNickname")}
          label='Your Nickname'
          error={!!errors.hostNickname}
          required
          fullWidth
          helperText='This will be your display name in the game'
          // slotProps={{ htmlInput: { maxLength: 50 } }}
        />
        {errors.hostNickname && (
          <Typography component='span' color='error'>
            {errors.hostNickname.message}
          </Typography>
        )}
        <Divider />

        {/* Theme */}
        <TextField
          {...register("theme")}
          label='Game Theme'
          required
          fullWidth
          placeholder='e.g., Animals, Food, Movies, Sports'
          helperText='AI will generate 5 words related to this theme'
          // slotProps={{ htmlInput: { maxLength: 100 } }}
        />
        {errors.theme && (
          <Typography component='caption' color='error'>
            {errors.theme.message}
          </Typography>
        )}
        <Divider />

        {/* Game Mode */}
        <FormControl fullWidth>
          <InputLabel>Game Mode</InputLabel>
          <Select
            {...register("gameMode")}
            label='Game Mode'
            error={!!errors.gameMode}
            value={formValues.gameMode}
            onChange={(e) => {
              // onChange to update react-hook-form
              setValue("gameMode", e.target.value as GameMode, {
                shouldValidate: true,
              });
            }}
          >
            <MenuItem value={GameMode.VERSUS}>
              Versus (1v1 head-to-head)
            </MenuItem>
          </Select>
          {errors.gameMode && (
            <Typography component='caption' color='error'>
              {errors.gameMode.message}
            </Typography>
          )}
        </FormControl>

        <Divider />

        {/* Max Rounds */}
        <Box>
          <Typography gutterBottom>
            Number of Rounds: {formValues.maxRounds}
          </Typography>
          <Slider
            value={formValues.maxRounds}
            onChange={(event, value) => setValue("maxRounds", value as number)}
            min={1}
            max={5}
            marks
            step={1}
            valueLabelDisplay='auto'
          />
          <Typography variant='caption' color='text.secondary'>
            Each player will draw {formValues.maxRounds} time(s)
          </Typography>
          {errors.maxRounds && (
            <Typography component='caption' color='error'>
              {errors.maxRounds.message}
            </Typography>
          )}
        </Box>

        {/* Drawing Time */}
        <Box>
          <Typography gutterBottom>
            Drawing Time: {formValues.drawingTime} seconds
          </Typography>
          <Slider
            value={formValues.drawingTime}
            onChange={(event, value) =>
              setValue("drawingTime", value as number)
            }
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
          {errors.drawingTime && (
            <Typography component='caption' color='error'>
              {errors.drawingTime.message}
            </Typography>
          )}
        </Box>

        {/* Guessing Time */}
        <Box>
          <Typography gutterBottom>
            Guessing Time: {formValues.guessingTime} seconds
          </Typography>
          <Slider
            value={formValues.guessingTime}
            onChange={(event, value) =>
              setValue("guessingTime", value as number)
            }
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
          {errors.guessingTime && (
            <Typography component='caption' color='error'>
              {errors.guessingTime.message}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Summary */}
        <CreateGameSummary props={formValues} />

        {/* Submit Button */}
        <Button
          type='submit'
          variant='contained'
          size='large'
          fullWidth
          disabled={isSubmitting}
          sx={{ py: 1.5 }}
        >
          {isSubmitting ? "Creating Game..." : "Create Game"}
        </Button>

        <Button variant='outlined' fullWidth onClick={() => router.push("/")}>
          Back to Lobby
        </Button>
      </Stack>
    </Box>
  );
}
