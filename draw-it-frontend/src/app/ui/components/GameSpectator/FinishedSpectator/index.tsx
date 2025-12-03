import { GameSpectatorDTO } from "@/app/lib/game.type";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Alert,
} from "@mui/material";
import Image from "next/image";

export type FinishedSpectatorProps = {
  gameData: GameSpectatorDTO;
};
const FinishedSpectator = ({ props }: { props: FinishedSpectatorProps }) => {
  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant='h4' gutterBottom>
          Game kết thúc: {props.gameData.gameCode}
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
                  {props.gameData.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index: number) => (
                      <TableRow key={player.sessionId}>
                        <TableCell>
                          {index === 0 && "No. 1. "}
                          {index === 1 && "No. 2. "}
                          {index === 2 && "No. 3. "}
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

        {props.gameData.allRounds?.map((round) => (
          <Card key={round.roundNumber} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Vòng {round.roundNumber} - {round.drawer} draws &quot;
                {round.selectedWord}&quot;
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Image
                    src={round.drawingData || ""}
                    alt={`Round ${round.roundNumber}`}
                    style={{
                      maxWidth: "100%",
                      border: "2px solid #ccc",
                      borderRadius: 4,
                    }}
                  />
                  {round.containsText && (
                    <Alert severity='warning' sx={{ mt: 1 }}>
                      Containing Characters
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
                        {round.guesses.map((guess, idx: number) => (
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
    </>
  );
};

export default FinishedSpectator;
