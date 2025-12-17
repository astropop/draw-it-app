"use client";

// Top banner
import { Box, Container, Paper, Typography } from "@mui/material";

const HomePage = () => {
  return (
    <Container sx={{ pt: 1 }}>
      <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Draw-it
        </Typography>
        <Typography variant='body2' color='text.secondary' component='p'>
          Draw, guess, and have fun!
        </Typography>

        <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: "divider" }}>
          <Typography variant='caption' color='text.secondary'>
            No account needed • Play instantly • Powered by AI
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};
export default HomePage;
