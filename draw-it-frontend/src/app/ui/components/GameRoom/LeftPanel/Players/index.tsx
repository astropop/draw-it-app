import { GameResponseDTO, GameStatus, PlayerDTO } from "@/app/types/game.type";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  IconButton,
  ListItemText,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
export type PlayerProps = {
  currentPlayers: PlayerDTO[];
  localGameState: GameResponseDTO;
  isHost: boolean;
  handleKick: (targetSessionId: string) => void;
  isMyTurn: boolean;
  currentSessionId: string;
};

const Players = ({ props }: { props: PlayerProps }) => {
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <PeopleIcon sx={{ mr: 1 }} />
        <Typography variant='h6'>
          Players ({props.currentPlayers.length})
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List dense>
        {props.currentPlayers.map((player) => (
          <ListItem
            key={player.sessionId}
            secondaryAction={
              props.isHost &&
              !player.isHost &&
              props.localGameState.status === GameStatus.WAITING && (
                <IconButton
                  edge='end'
                  onClick={() => props.handleKick(player.sessionId)}
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {player.nickname}
                  {player.isHost && (
                    <Chip label='Host' color='primary' size='small' />
                  )}
                  {props.localGameState.status === GameStatus.IN_PROGRESS &&
                    props.isMyTurn &&
                    player.sessionId === props.currentSessionId && (
                      <Chip label='Drawing' color='secondary' size='small' />
                    )}
                </Box>
              }
              secondary={`Score: ${player.score || 0}`}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default Players;
