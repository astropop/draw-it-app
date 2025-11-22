import { Card, CardContent, Divider, Typography } from "@mui/material";

const Instructions = () => {
  return (
    <>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            How to Play
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant='body2' component='div'>
            <ol style={{ paddingLeft: 20 }}>
              <li>Wait for host to start</li>
              <li>When it&apos;s your turn, choose a word</li>
              <li>Draw it within time limit</li>
              <li>Others guess your drawing</li>
              <li>Faster correct guesses = more points</li>
            </ol>
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default Instructions;
