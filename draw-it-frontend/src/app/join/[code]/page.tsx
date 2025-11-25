// app/join/[code]/page.tsx
import JoinGameFormPrefilled from "@/app/ui/components/JoinGamePrefilled";
import { Container, Typography, Paper } from "@mui/material";

interface JoinByCodePageProps {
  params: {
    code: string;
  };
}

export default async function JoinByCodePage({ params }: JoinByCodePageProps) {
  const { code } = await params;
  const gameCode = code;

  return (
    <Container maxWidth='sm' sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Join Game
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Joining game: <strong>{gameCode}</strong>
        </Typography>

        <JoinGameFormPrefilled gameCode={gameCode} />
      </Paper>
    </Container>
  );
}
