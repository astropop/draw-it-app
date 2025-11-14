"use client";

// app/page.tsx
import {
  Container,
  Typography,
  Button,
  Stack,
  Paper,
  Box,
} from "@mui/material";
import Link from "next/link";

const HomePage = () => {
  return (
    <Container maxWidth='sm' sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: "center" }}>
        <Typography variant='h3' component='h1' gutterBottom>
          🎨 Drawing Game
        </Typography>
        <Typography variant='body1' color='text.secondary' paragraph>
          Draw, guess, and have fun with friends!
        </Typography>

        <Stack spacing={2} sx={{ mt: 4 }}>
          <Button
            component={Link}
            href='/create'
            variant='contained'
            size='large'
            fullWidth
          >
            Create New Game
          </Button>

          <Button
            component={Link}
            href='/join'
            variant='outlined'
            size='large'
            fullWidth
          >
            Join Game
          </Button>

          <Button
            component={Link}
            href='/lobby'
            variant='outlined'
            size='large'
            fullWidth
          >
            Browse Games
          </Button>
        </Stack>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
          <Typography variant='caption' color='text.secondary'>
            No account needed • Play instantly • Powered by AI
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};
export default HomePage;
// export default async function HomePage() {

// }
