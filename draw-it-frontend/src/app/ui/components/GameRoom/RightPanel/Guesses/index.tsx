import { GuessSubmittedMessage } from "@/app/lib/game.type";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
} from "@mui/material";

const Guesses = ({ guesses }: { guesses: GuessSubmittedMessage[] }) => {
  return (
    <>
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
            {guesses.map((g, index: number) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
    </>
  );
};

export default Guesses;
