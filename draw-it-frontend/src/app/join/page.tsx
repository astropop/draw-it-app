"use server";

import { Container, Paper, Typography } from "@mui/material";
import JoinGameForm from "../ui/components/JoinGameForm";

export default async function JoinGamePage() {
  return (
    <Container maxWidth='sm' sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Join Game
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Enter the game code to join an existing game
        </Typography>

        <JoinGameForm />
      </Paper>
    </Container>
  );
}
