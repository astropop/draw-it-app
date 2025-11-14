// app/create/page.tsx

import { Container, Typography, Paper } from "@mui/material";
import CreateGameForm from "../ui/components/CreateGameForm";

export default async function CreateGamePage() {
  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Create New Game
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Set up your drawing game and invite friends!
        </Typography>

        <CreateGameForm />
      </Paper>
    </Container>
  );
}
