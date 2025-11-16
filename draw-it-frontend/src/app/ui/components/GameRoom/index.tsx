// app/components/GameRoom.tsx - FULL VERSION
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Paper,
  Alert,
  Container,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  LinearProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import TimerIcon from "@mui/icons-material/Timer";
import PeopleIcon from "@mui/icons-material/People";
import { useWebSocket } from "@/app/hooks/useWebSocket";
import { gameApi } from "@/app/lib/api";
import { GameResponseDTO, GameStatus } from "@/app/types/game.type";
import DrawingCanvas from "../DrawingCanvas";
import { useMockWebSocket } from "@/app/hooks/useWebSocket.mock";

interface GameRoomProps {
  gameData: GameResponseDTO;
}

// Default constants
const DEFAULT_DRAWING_TIME = 120;
const DEFAULT_GUESSING_TIME = 60;
const DEFAULT_MAX_ROUNDS = 3;
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function GameRoom({ gameData }: GameRoomProps) {
  // Ensure defaults are set
  const initialGameState: GameResponseDTO = {
    ...gameData,
    drawingTime: gameData.drawingTime ?? DEFAULT_DRAWING_TIME,
    guessingTime: gameData.guessingTime ?? DEFAULT_GUESSING_TIME,
    maxRounds: gameData.maxRounds ?? DEFAULT_MAX_ROUNDS,
  };

  // State management
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [currentNickname, setCurrentNickname] = useState<string>("");
  const [isHost, setIsHost] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [guess, setGuess] = useState<string>("");
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [localGameState, setLocalGameState] =
    useState<GameResponseDTO>(initialGameState);
  const [currentRoundId, setCurrentRoundId] = useState<number | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerType, setTimerType] = useState<"drawing" | "guessing" | null>(
    null
  );
  const [roundComplete, setRoundComplete] = useState(false);
  const websocketHook = USE_MOCK ? useMockWebSocket : useWebSocket;
  // WebSocket connection
  const {
    connected,
    players,
    gameState,
    currentDrawing,
    guesses,
    kickPlayer,
    sendDrawing,
  } = websocketHook(gameData.gameCode);

  // ✅ Initialize session from localStorage
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId") || gameData.sessionId;
    const nickname = localStorage.getItem("nickname") || "";

    setCurrentSessionId(sessionId);
    setCurrentNickname(nickname);
    setLocalGameState(initialGameState);

    console.log("GameRoom initialized:", {
      sessionId,
      nickname,
      gameCode: gameData.gameCode,
      status: gameData.status,
      isHost: gameData.isHost,
    });
  }, [gameData]);

  // ✅ Check if current user is host
  useEffect(() => {
    // Use gameData.isHost if available
    if (gameData.isHost !== undefined) {
      setIsHost(gameData.isHost);
      return;
    }

    // Fallback: check from players list
    if (players.length > 0 && currentSessionId) {
      const currentPlayer = players.find(
        (p: any) => p.sessionId === currentSessionId
      );
      setIsHost(currentPlayer?.isHost ?? false);
    } else if (gameData.players?.length > 0 && currentSessionId) {
      const currentPlayer = gameData.players.find(
        (p) => p.sessionId === currentSessionId
      );
      setIsHost(currentPlayer?.isHost ?? false);
    }
  }, [players, currentSessionId, gameData.isHost, gameData.players]);

  // ✅ Determine whose turn it is
  useEffect(() => {
    if (localGameState.status === GameStatus.IN_PROGRESS) {
      const myTurn = localGameState.currentDrawerSessionId === currentSessionId;
      setIsMyTurn(myTurn);
    }
  }, [
    localGameState.status,
    localGameState.currentDrawerSessionId,
    currentSessionId,
  ]);

  // Update game state from WebSocket
  useEffect(() => {
    if (gameState) {
      setLocalGameState((prev) => ({
        ...prev,
        status: gameState.status || prev.status,
        currentRound: gameState.currentRound || prev.currentRound,
        maxRounds: gameState.maxRounds || prev.maxRounds,
      }));

      if (
        gameState.type === "GAME_STARTED" ||
        gameState.type === "NEXT_ROUND"
      ) {
        setSelectedWord("");
        setGuess("");
        setShowWarning(false);
        setRoundComplete(false);

        const myTurn = gameState.currentDrawer === currentNickname;
        setIsMyTurn(myTurn);

        if (myTurn) {
          setTimerType("drawing");
          setTimeLeft(localGameState.drawingTime ?? DEFAULT_DRAWING_TIME);
        }
      } else if (gameState.type === "GAME_FINISHED") {
        alert("🎉 Game finished! Check the results.");
        window.location.href = `/spectate/${gameData.gameCode}`;
      }
    }
  }, [gameState, currentNickname]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && timerType) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerType === "drawing" && selectedWord && isMyTurn) {
              handleAutoSubmitDrawing();
            } else if (timerType === "guessing" && !roundComplete) {
              handleAutoSubmitGuess();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, timerType, selectedWord, isMyTurn, roundComplete]);

  // Start guessing timer when drawing is submitted
  useEffect(() => {
    if (currentDrawing && !isMyTurn && !roundComplete) {
      setTimerType("guessing");
      setTimeLeft(localGameState.guessingTime ?? DEFAULT_GUESSING_TIME);
    }
  }, [currentDrawing, isMyTurn, localGameState.guessingTime, roundComplete]);

  // Handle functions
  const handleStartGame = async () => {
    try {
      await gameApi.startGame(gameData.gameCode);
      console.log("✅ Game started");
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Failed to start game. Please try again.");
    }
  };

  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
    console.log("✅ Word selected:", word);
  };

  const handleSubmitDrawing = async (imageData: string) => {
    if (!selectedWord) {
      alert("Please select a word first!");
      return;
    }

    try {
      const response = await gameApi.submitDrawing({
        roundId: currentRoundId ?? 1, // Mock round ID
        drawingData: imageData,
        selectedWord: selectedWord,
      });

      if (response.containsKeyword) {
        setShowWarning(true);
        setWarningMessage(
          response.warning || "Your drawing contains the keyword text!"
        );
      }

      sendDrawing(imageData);
      setTimerType(null);
      setTimeLeft(0);
      console.log("Drawing submitted");
    } catch (error) {
      console.error("Failed to submit drawing:", error);
      alert("Failed to submit drawing. Please try again.");
    }
  };

  const handleAutoSubmitDrawing = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const imageData = canvas.toDataURL("image/png");
      handleSubmitDrawing(imageData);
    }
  };

  const handleSubmitGuess = async () => {
    if (!guess.trim()) {
      alert("Please enter your guess!");
      return;
    }

    try {
      await gameApi.submitGuess({
        roundId: currentRoundId ?? 1,
        guess: guess.trim(),
      });

      setGuess("");
      setRoundComplete(true);
      setTimerType(null);
      setTimeLeft(0);
      console.log("Guess submitted:", guess);
    } catch (error) {
      console.error("Failed to submit guess:", error);
      alert("Failed to submit guess. Please try again.");
    }
  };

  const handleAutoSubmitGuess = () => {
    if (guess.trim()) {
      handleSubmitGuess();
    }
  };

  const handleKick = (targetSessionId: string) => {
    if (window.confirm("Are you sure you want to kick this player?")) {
      kickPlayer(targetSessionId);
    }
  };

  // Get current player list
  const currentPlayers =
    players.length > 0 ? players : localGameState.players || [];

  return (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid sx={{ xs: 12, md: 6 }}>
            <Typography variant='h4' component='h1'>
              Game Room: <Chip label={gameData.gameCode} color='primary' />
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Theme: {localGameState.theme} | Language:{" "}
              {localGameState.language}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              You: {currentNickname} ({isHost ? "Host" : "Player"})
            </Typography>
          </Grid>

          <Grid sx={{ textAlign: { xs: "left", md: "right" }, xs: 12, md: 6 }}>
            <Stack
              direction='row'
              spacing={1}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
            >
              <Chip
                label={connected ? "Connected" : "Disconnected"}
                color={connected ? "success" : "error"}
                size='small'
              />
              {localGameState.status === GameStatus.IN_PROGRESS && (
                <Chip
                  label={`Round ${localGameState.currentRound} / ${localGameState.maxRounds}`}
                  color='info'
                  size='small'
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Panel - Players */}
        <Grid sx={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant='h6'>
                  Players ({currentPlayers.length})
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <List dense>
                {currentPlayers.map((player: any) => (
                  <ListItem
                    key={player.sessionId}
                    secondaryAction={
                      isHost &&
                      !player.isHost &&
                      localGameState.status === GameStatus.WAITING && (
                        <IconButton
                          edge='end'
                          onClick={() => handleKick(player.sessionId)}
                          color='error'
                          size='small'
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {player.nickname}
                          {player.isHost && (
                            <Chip label='Host' color='primary' size='small' />
                          )}
                          {localGameState.status === GameStatus.IN_PROGRESS &&
                            isMyTurn &&
                            player.sessionId === currentSessionId && (
                              <Chip
                                label='Drawing'
                                color='secondary'
                                size='small'
                              />
                            )}
                        </Box>
                      }
                      secondary={`Score: ${player.score || 0}`}
                    />
                  </ListItem>
                ))}
              </List>

              {/* ✅ START BUTTON - Only for host in WAITING status */}
              {isHost && localGameState.status === GameStatus.WAITING && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    variant='contained'
                    fullWidth
                    onClick={handleStartGame}
                    disabled={currentPlayers.length < 2}
                    size='large'
                  >
                    Start Game
                  </Button>
                  {currentPlayers.length < 2 && (
                    <Typography
                      variant='caption'
                      color='error'
                      sx={{ mt: 1, display: "block" }}
                    >
                      Need at least 2 players
                    </Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Timer */}
          {timerType && timeLeft > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <TimerIcon sx={{ mr: 1 }} />
                  <Typography variant='h6'>
                    {timerType === "drawing" ? "Drawing Time" : "Guessing Time"}
                  </Typography>
                </Box>
                <Typography
                  variant='h3'
                  color={timeLeft <= 10 ? "error" : "primary"}
                >
                  {timeLeft}s
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={
                    (timeLeft /
                      (timerType === "drawing"
                        ? localGameState.drawingTime!
                        : localGameState.guessingTime!)) *
                    100
                  }
                  sx={{ mt: 1 }}
                  color={timeLeft <= 10 ? "error" : "primary"}
                />
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Middle Panel - Game Area */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              {/* ✅ WAITING STATE */}
              {localGameState.status === GameStatus.WAITING && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography variant='h5' gutterBottom>
                    {isHost
                      ? 'Click "Start Game" when ready!'
                      : "Waiting for host to start..."}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {currentPlayers.length} players joined
                  </Typography>
                </Box>
              )}

              {/* ✅ IN PROGRESS STATE */}
              {localGameState.status === GameStatus.IN_PROGRESS && (
                <>
                  {/* ✅ WORD SELECTION (My Turn, No Word Selected) */}
                  {isMyTurn && !selectedWord && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant='h5' gutterBottom>
                        Choose a word to draw:
                      </Typography>
                      <Stack
                        direction='row'
                        spacing={2}
                        justifyContent='center'
                        flexWrap='wrap'
                        sx={{ mt: 3 }}
                        useFlexGap
                      >
                        {(localGameState.words || []).map((word: string) => (
                          <Button
                            key={word}
                            variant='outlined'
                            size='large'
                            onClick={() => handleWordSelect(word)}
                            sx={{ minWidth: 120, mb: 1 }}
                          >
                            {word}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* ✅ DRAWING CANVAS (My Turn, Word Selected) */}
                  {isMyTurn && selectedWord && (
                    <Box>
                      <Alert severity='info' sx={{ mb: 2 }}>
                        Draw: <strong>{selectedWord}</strong>
                      </Alert>

                      {showWarning && (
                        <Alert severity='error' sx={{ mb: 2 }}>
                          ⚠️ {warningMessage}
                        </Alert>
                      )}

                      <DrawingCanvas
                        selectedWord={selectedWord}
                        onSubmit={handleSubmitDrawing}
                        timeLimit={localGameState.drawingTime!}
                      />
                    </Box>
                  )}

                  {/* ✅ GUESSING (Other's Turn, Drawing Shown) */}
                  {!isMyTurn && currentDrawing && (
                    <Box>
                      <Typography variant='h6' gutterBottom>
                        Guess the drawing:
                      </Typography>

                      <Box
                        sx={{
                          border: "2px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          overflow: "hidden",
                          mb: 2,
                        }}
                      >
                        <img
                          src={currentDrawing}
                          alt='Current Drawing'
                          style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                          }}
                        />
                      </Box>

                      {!roundComplete && (
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <TextField
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            placeholder='Type your guess...'
                            fullWidth
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleSubmitGuess();
                              }
                            }}
                            disabled={roundComplete}
                          />
                          <Button
                            variant='contained'
                            onClick={handleSubmitGuess}
                            disabled={!guess.trim() || roundComplete}
                            sx={{ minWidth: 100 }}
                          >
                            Submit
                          </Button>
                        </Box>
                      )}

                      {roundComplete && (
                        <Alert severity='success'>
                          ✓ Your answer has been submitted! Waiting for
                          others...
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* ✅ WAITING (Other's Turn, No Drawing Yet) */}
                  {!isMyTurn && !currentDrawing && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <Typography variant='h6' color='text.secondary'>
                        Waiting for someone to draw...
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Guesses/Activity */}
        <Grid sx={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Recent Guesses
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {guesses.length === 0 && (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ textAlign: "center", py: 4 }}
                >
                  No guesses yet
                </Typography>
              )}

              <List dense sx={{ maxHeight: 400, overflow: "auto" }}>
                {guesses.map((g: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant='body2'>
                            {g.playerNickname}:
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              fontWeight: g.isCorrect ? "bold" : "normal",
                              color: g.isCorrect
                                ? "success.main"
                                : "text.secondary",
                            }}
                          >
                            {g.guess}
                          </Typography>
                          {g.isCorrect && (
                            <Chip
                              label={`+${g.pointsEarned}`}
                              color='success'
                              size='small'
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Instructions */}
          {localGameState.status === GameStatus.WAITING && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  How to Play
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant='body2' component='div'>
                  <ol style={{ paddingLeft: 20 }}>
                    <li>Wait for host to start</li>
                    <li>When it's your turn, choose a word</li>
                    <li>Draw it within time limit</li>
                    <li>Others guess your drawing</li>
                    <li>Faster correct guesses = more points</li>
                  </ol>
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
