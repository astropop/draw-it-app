"use client";

import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const RecentGames = () => {
  const router = useRouter();
  const [recentGame, setRecentGame] = useState<{
    code: string;
    nickname: string;
  } | null>(null);

  useEffect(() => {
    const lastGame = localStorage.getItem("lastGame");
    const lastNickname = localStorage.getItem("lastNickname");

    if (lastGame && lastNickname) {
      setRecentGame({ code: lastGame, nickname: lastNickname });
    }
  }, []);

  if (!recentGame) return null;

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
        onClick={() => router.push(`/game/${recentGame.code}`)}
      >
        <Typography variant='body2'>
          <strong>{recentGame.code}</strong> as <em>{recentGame.nickname}</em>
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Click to rejoin
        </Typography>
      </Box>
    </Box>
  );
};

export default RecentGames;
