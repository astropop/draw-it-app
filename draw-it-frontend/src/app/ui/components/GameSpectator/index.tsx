// app/components/GameSpectator.tsx
"use client";

import { SpectateGameResponseDto } from "@/app/lib/api/SpectateGame/type";
import { Brush, Cancel, CheckCircle, Timer } from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { formatDate, getStatusColor, getStatusLabel } from "../../utils";

export default function GameSpectator({
  initialData,
}: {
  initialData: SpectateGameResponseDto;
}) {
  const [gameData, setGameData] = useState(initialData);

  // highest to lowest score
  const sortedPlayers = [...gameData.playersInGame].sort(
    (a, b) => b.score - a.score
  );

  return (
    <>
      <Container maxWidth='md'>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant='h4'>Theme: {gameData.theme}</Typography>
          <Chip
            label={getStatusLabel(gameData.status)}
            color={getStatusColor(gameData.status)}
            size='small'
          />
        </Box>

        {/* Room info */}
        <Card sx={{ mb: 3 }}>
          <CardContent title='Room Information'>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Game Code
                </Typography>
                <Typography variant='h6' sx={{ letterSpacing: 2 }}>
                  {gameData.gameCode}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Rounds
                </Typography>
                <Typography variant='body1'>{gameData.maxRounds}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant='subtitle2' color='textSecondary'>
                  Total Players
                </Typography>
                <Typography variant='body1'>
                  {gameData.playersInGame.length}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography
                  variant='caption'
                  display='block'
                  color='textSecondary'
                >
                  Created At
                </Typography>
                <Typography variant='body2'>
                  {formatDate(gameData.createdAt)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography
                  variant='caption'
                  display='block'
                  color='textSecondary'
                >
                  Started At
                </Typography>
                <Typography variant='body2'>
                  {formatDate(gameData.startedAt || "")}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography
                  variant='caption'
                  display='block'
                  color='textSecondary'
                >
                  Finished At
                </Typography>
                <Typography variant='body2'>
                  {formatDate(gameData.finishedAt || "")}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card sx={{ mb: 4 }}>
          <CardHeader title='Players List' />
        </Card>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ xs: 12, md: 7 }}>Nick Name</TableCell>
                <TableCell align='center' sx={{ xs: 12, md: 3 }}>
                  Role
                </TableCell>
                <TableCell align='right' sx={{ xs: 12, md: 2 }}>
                  Score
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedPlayers.map((player) => (
                <TableRow key={player.playerSessionId}>
                  <TableCell>{player.nickname}</TableCell>
                  <TableCell align='center'>
                    {player.isHost && (
                      <Chip label='Host' color='primary' size='small' />
                    )}
                  </TableCell>
                  <TableCell align='right'>{player.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Rounds info */}

        {gameData.allRounds && gameData.allRounds.length > 0 && (
          <>
            <Typography variant='h5' gutterBottom sx={{ mt: 4, mb: 2 }}>
              Rounds History
            </Typography>
            <Stack spacing={3} mt={6}>
              {gameData.allRounds.map((round) => (
                <Card
                  key={
                    round.drawerPlayerSessionId +
                    round.roundNumber +
                    round.turnNumber
                  }
                >
                  <CardContent>
                    <Grid container alignItems='baseline' sx={{ mb: 2 }}>
                      <Grid
                        sx={{
                          xs: 12,
                          md: 8,
                        }}
                      >
                        <Typography variant='h6'>
                          Round {round.roundNumber} - Turn {round.turnNumber}
                        </Typography>
                        <Stack
                          direction='row'
                          spacing={1}
                          alignItems='center'
                          sx={{ mt: 1 }}
                        >
                          <Chip
                            icon={<Brush />}
                            label={`Drawer: ${round.drawerNickname}`}
                            color='primary'
                            variant='outlined'
                          />
                          <Chip
                            icon={<Timer />}
                            label={`${round.drawingTime}s`}
                            size='small'
                          />
                        </Stack>
                      </Grid>
                      <Grid
                        sx={{
                          xs: 12,
                          md: 4,
                          textAlign: { md: "right", xs: "left" },
                          mt: { xs: 2, md: 0 },
                          display: "flex",
                        }}
                      >
                        <Typography variant='caption' color='textSecondary'>
                          Keyword:{" "}
                        </Typography>
                        <Typography
                          variant='caption'
                          color='secondary'
                          sx={{
                            fontWeight: "bold",
                          }}
                        >
                          {round.selectedWord}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <Box sx={{ width: 350, height: 280 }}>
                          {round.drawingData &&
                          round.drawingData.length > 50 ? (
                            <>
                              <Image
                                src={round.drawingData}
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  display: "block",
                                }}
                                width={500}
                                height={400}
                                alt={`Round ${round.roundNumber} Turn ${round.turnNumber} Drawing`}
                              />
                            </>
                          ) : (
                            <Typography variant='body2' color='textSecondary'>
                              [No drawing data: {round.drawingData}]
                            </Typography>
                          )}
                        </Box>
                        <Typography
                          variant='caption'
                          sx={{ display: "block", mt: 1, textAlign: "center" }}
                        >
                          Submitted at: {formatDate(round.submitAt)}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, md: 7 }}>
                        <Typography
                          variant='subtitle1'
                          gutterBottom
                          sx={{ fontWeight: "bold" }}
                        >
                          Guesses ({round.guesses.length})
                        </Typography>

                        {round.guesses.length === 0 ? (
                          <Alert severity='info'>
                            No guesses were made in this round.
                          </Alert>
                        ) : (
                          <TableContainer component={Paper} variant='outlined'>
                            <Table size='small'>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Guesser</TableCell>
                                  <TableCell>Guess</TableCell>
                                  <TableCell align='center'>Result</TableCell>
                                  <TableCell align='right'>Points</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {round.guesses.map((guess, gIdx) => (
                                  <TableRow
                                    key={gIdx}
                                    sx={{
                                      bgcolor: guess.isCorrect
                                        ? "#e8f5e9"
                                        : "transparent",
                                    }}
                                  >
                                    <TableCell>
                                      {guess.playerNickname}
                                    </TableCell>
                                    <TableCell sx={{ fontStyle: "italic" }}>
                                      "{guess.guessedWord}"
                                    </TableCell>
                                    <TableCell align='center'>
                                      {guess.isCorrect ? (
                                        <CheckCircle
                                          color='success'
                                          fontSize='small'
                                        />
                                      ) : (
                                        <Cancel
                                          color='error'
                                          fontSize='small'
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell align='right'>
                                      {guess.pointsEarned > 0
                                        ? `+${guess.pointsEarned}`
                                        : 0}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </>
        )}
      </Container>
    </>
  );
}
