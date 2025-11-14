// app/components/GameSpectator.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import { useWebSocket } from "@/app/hooks/useWebSocket";
import { GameSpectatorDTO } from "@/app/types/game.type";

export default function GameSpectator({
  initialData,
}: {
  initialData: GameSpectatorDTO;
}) {
  const [gameData, setGameData] = useState(initialData);
  const { players, currentDrawing, guesses, gameState } = useWebSocket(
    initialData.gameCode
  );

  useEffect(() => {
    if (players.length > 0) {
      setGameData((prev: any) => ({ ...prev, players }));
    }
  }, [players]);

  useEffect(() => {
    if (gameState?.type === "GAME_FINISHED") {
      // Reload full game data
      fetch(`/api/games/${initialData.gameCode}/spectate`)
        .then((res) => res.json())
        .then((data) => setGameData(data));
    }
  }, [gameState, initialData.gameCode]);

  if (gameData.status === "WAITING") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant='h4' gutterBottom>
          Game: {gameData.gameCode}
        </Typography>
        <Alert severity='info'>Game đang chờ người chơi...</Alert>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Người chơi</TableCell>
                <TableCell>Vai trò</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gameData.players.map((player: any) => (
                <TableRow key={player.sessionId}>
                  <TableCell>{player.nickname}</TableCell>
                  <TableCell>
                    {player.isHost && (
                      <Chip label='Host' color='primary' size='small' />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (gameData.status === "IN_PROGRESS") {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant='h4' gutterBottom>
          Game: {gameData.gameCode} - {gameData.theme}
        </Typography>

        <Typography variant='h6' gutterBottom>
          Vòng {gameData.currentRound} / {gameData.maxRounds}
        </Typography>

        <Grid container spacing={3}>
          {/* Player list */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Bảng xếp hạng
                </Typography>
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>STT</TableCell>
                        <TableCell>Tên</TableCell>
                        <TableCell align='right'>Điểm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gameData.players
                        .sort((a: any, b: any) => b.score - a.score)
                        .map((player: any, index: number) => (
                          <TableRow key={player.sessionId}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              {player.nickname}
                              {player.nickname ===
                                gameData.currentRoundInfo?.drawer && (
                                <Chip
                                  label='Đang vẽ'
                                  color='secondary'
                                  size='small'
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </TableCell>
                            <TableCell align='right'>{player.score}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Current drawing */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Bài vẽ hiện tại - {gameData.currentRoundInfo?.drawer}
                </Typography>

                {(currentDrawing || gameData.currentRoundInfo?.drawingData) && (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <img
                        src={
                          currentDrawing ||
                          gameData.currentRoundInfo?.drawingData
                        }
                        alt='Drawing'
                        style={{
                          maxWidth: "100%",
                          border: "2px solid #ccc",
                          borderRadius: 4,
                        }}
                      />
                    </Box>

                    {gameData.currentRoundInfo?.containsText && (
                      <Alert severity='warning' sx={{ mb: 2 }}>
                        ⚠️ Bài vẽ có chứa chữ viết!
                      </Alert>
                    )}
                  </>
                )}

                <Typography variant='subtitle1' gutterBottom sx={{ mt: 3 }}>
                  Câu trả lời:
                </Typography>

                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Người chơi</TableCell>
                        <TableCell>Trả lời</TableCell>
                        <TableCell>Kết quả</TableCell>
                        <TableCell align='right'>Điểm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(guesses.length > 0
                        ? guesses
                        : gameData.currentRoundInfo?.guesses || []
                      ).map((guess: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{guess.playerNickname}</TableCell>
                          <TableCell>{guess.guess}</TableCell>
                          <TableCell>
                            {guess.isCorrect ? (
                              <Chip label='Đúng' color='success' size='small' />
                            ) : (
                              <Chip label='Sai' color='error' size='small' />
                            )}
                          </TableCell>
                          <TableCell align='right'>
                            +{guess.pointsEarned || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // FINISHED status
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Game kết thúc: {gameData.gameCode}
      </Typography>

      {/* Final leaderboard */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            🏆 Bảng xếp hạng cuối cùng
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hạng</TableCell>
                  <TableCell>Tên</TableCell>
                  <TableCell align='right'>Tổng điểm</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gameData.players
                  .sort((a: any, b: any) => b.score - a.score)
                  .map((player: any, index: number) => (
                    <TableRow key={player.sessionId}>
                      <TableCell>
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                        {index > 2 && `#${index + 1}`}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant='body1'
                          fontWeight={index === 0 ? "bold" : "normal"}
                        >
                          {player.nickname}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography
                          variant='h6'
                          color={index === 0 ? "primary" : "text.primary"}
                        >
                          {player.score}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* All rounds history */}
      <Typography variant='h5' gutterBottom sx={{ mt: 4 }}>
        Lịch sử các vòng chơi
      </Typography>

      {gameData.allRounds?.map((round: any) => (
        <Card key={round.roundNumber} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Vòng {round.roundNumber} - {round.drawer} vẽ "{round.selectedWord}
              "
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <img
                  src={round.drawingData}
                  alt={`Round ${round.roundNumber}`}
                  style={{
                    maxWidth: "100%",
                    border: "2px solid #ccc",
                    borderRadius: 4,
                  }}
                />
                {round.containsText && (
                  <Alert severity='warning' sx={{ mt: 1 }}>
                    ⚠️ Chứa chữ viết
                  </Alert>
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant='subtitle1' gutterBottom>
                  Câu trả lời:
                </Typography>
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Người chơi</TableCell>
                        <TableCell>Trả lời</TableCell>
                        <TableCell align='right'>Điểm</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {round.guesses.map((guess: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{guess.playerNickname}</TableCell>
                          <TableCell>
                            {guess.guess}
                            {guess.isCorrect && " ✓"}
                          </TableCell>
                          <TableCell align='right'>
                            +{guess.pointsEarned}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
