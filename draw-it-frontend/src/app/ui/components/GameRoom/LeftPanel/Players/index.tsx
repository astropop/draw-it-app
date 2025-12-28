import { GameResponseDto } from "@/app/lib/game.type";
import PeopleIcon from "@mui/icons-material/People";
import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
export type PlayerProps = {
  localGameState: GameResponseDto;
  handleKick: (targetPlayerSessionId: string) => Promise<void>; // players in object can be changed later
  currentPlayerSessionId: string;
  isHost: boolean; // current player is host or not
};

const Players = ({ props }: { props: PlayerProps }) => {
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <PeopleIcon sx={{ mr: 1 }} />
        <Typography variant='h6'>
          Players ({props.localGameState.players.length})
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List dense>
        {props.localGameState.players.map((player) => (
          <ListItem
            key={player.playerSessionId}
            // TODO comment out kick player feature
            // secondaryAction={
            //   props.isHost &&
            //   !player.isHost &&
            //   props.currentPlayerSessionId !== player.playerSessionId &&
            //   props.localGameState.status === GameStatus.WAITING && (
            //     <IconButton
            //       edge='end'
            //       onClick={() => props.handleKick(player.playerSessionId)}
            //       color='error'
            //       size='small'
            //     >
            //       <DeleteIcon fontSize='small' />
            //     </IconButton>
            //   )
            // }
          >
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {player.nickname}
                  {player.isHost && (
                    <Chip label='Host' color='primary' size='small' />
                  )}
                  {/* Icon drawing, guessing */}
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
