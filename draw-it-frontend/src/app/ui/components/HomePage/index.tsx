"use client";

// Top banner
import { Box, Container, Paper, Typography } from "@mui/material";

const HomePage = () => {
  return (
    <Container sx={{ pt: 6 }}>
      <Paper elevation={3} sx={{ p: 6, textAlign: "center" }}>
        <Typography variant='h3' component='h1' gutterBottom>
          Draw-it
        </Typography>
        <Typography variant='body1' color='text.secondary' component='p'>
          Draw, guess, and have fun!
        </Typography>

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
