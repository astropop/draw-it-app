"use client";

import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const RecentGames = () => {
  const router = useRouter();

  const lastGame = localStorage.getItem("lastGame");
  const lastNickname = localStorage.getItem("lastNickname");

  if (!lastGame) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant='caption' color='text.secondary'>
        Recent game:
      </Typography>
      <Box
        sx={{
          mt: 1,
          p: 2,
          bgcolor: "grey.100",
          borderRadius: 1,
          cursor: "pointer",
          "&:hover": { bgcolor: "grey.200" },
        }}
        onClick={() => router.push(`/game/${lastGame}`)}
      >
        <Typography variant='body2'>
          <strong>{lastGame}</strong> as <em>{lastNickname}</em>
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Click to rejoin
        </Typography>
      </Box>
    </Box>
  );
};

export default RecentGames;
