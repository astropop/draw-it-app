import { CreateGameInput } from "@/app/lib/validation";
import { Box, Typography, Grid } from "@mui/material";

const CreateGameSummary = ({ props }: { props: CreateGameInput }) => {
  return (
    <>
      <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
        <Typography variant='subtitle2' gutterBottom>
          Game Summary:
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <Typography variant='body2' color='text.secondary'>
              Mode:
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant='body2'>1v1</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant='body2' color='text.secondary'>
              Rounds:
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant='body2'>{props.maxRounds}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant='body2' color='text.secondary'>
              Est. Duration:
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant='body2'>
              ~
              {Math.ceil(
                ((props.drawingTime + props.guessingTime) * props.maxRounds) /
                  60
              )}
              minutes
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default CreateGameSummary;
