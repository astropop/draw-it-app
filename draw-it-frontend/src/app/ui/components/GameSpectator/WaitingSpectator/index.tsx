"use client";
import { GameSpectatorDTO } from "@/app/types/game.type";
import {
  Box,
  Typography,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";

export type WaitingSpectatorProps = {
  gameData: GameSpectatorDTO;
};

const WaitingSpectator = ({ props }: { props: WaitingSpectatorProps }) => {
  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant='h4' gutterBottom>
          Game: {props.gameData.gameCode}
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
              {props.gameData.players.map((player) => (
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
    </>
  );
};

export default WaitingSpectator;
