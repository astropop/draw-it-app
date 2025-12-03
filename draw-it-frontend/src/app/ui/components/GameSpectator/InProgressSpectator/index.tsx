import { GameSpectatorDTO, GuessSubmittedMessage } from "@/app/lib/game.type";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export type InProgressSpectatorProps = {
  gameData: GameSpectatorDTO;
  currentDrawing: string | null;
  guesses: GuessSubmittedMessage[];
};

const InProgressSpectator = ({
  props,
}: {
  props: InProgressSpectatorProps;
}) => {
  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant='h4' gutterBottom>
          Game: {props.gameData.gameCode} - {props.gameData.theme}
        </Typography>

        <Typography variant='h6' gutterBottom>
          Vòng {props.gameData.currentRound} / {props.gameData.maxRounds}
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
                      {props.gameData.players
                        .sort((a, b) => b.score - a.score)
                        .map((player, index: number) => (
                          <TableRow key={player.sessionId}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              {player.nickname}
                              {player.nickname ===
                                props.gameData.currentRoundInfo?.drawer && (
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
                  Bài vẽ hiện tại - {props.gameData.currentRoundInfo?.drawer}
                </Typography>

                {(props.currentDrawing ||
                  props.gameData.currentRoundInfo?.drawingData) && (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <img
                        src={
                          props.currentDrawing ||
                          props.gameData.currentRoundInfo?.drawingData
                        }
                        alt='Drawing'
                        style={{
                          maxWidth: "100%",
                          border: "2px solid #ccc",
                          borderRadius: 4,
                        }}
                      />
                    </Box>

                    {props.gameData.currentRoundInfo?.containsText && (
                      <Alert severity='warning' sx={{ mb: 2 }}>
                        The paint contains some characters!
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
                        <TableCell>Player</TableCell>
                        <TableCell>Answer</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell align='right'>Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(props.guesses.length > 0
                        ? props.guesses
                        : props.gameData.currentRoundInfo?.guesses || []
                      ).map((guess, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{guess.playerNickname}</TableCell>
                          <TableCell>{guess.guess}</TableCell>
                          <TableCell>
                            {guess.isCorrect ? (
                              <Chip
                                label='Correct'
                                color='success'
                                size='small'
                              />
                            ) : (
                              <Chip label='Wrong' color='error' size='small' />
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
    </>
  );
};

export default InProgressSpectator;
