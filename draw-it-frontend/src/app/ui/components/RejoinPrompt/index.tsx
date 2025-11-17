"use client";

import { Button, Dialog } from "@mui/material";
import { useEffect, useState } from "react";

export default function RejoinPrompt() {
  const [open, setOpen] = useState(false);

  const savedGame = localStorage.getItem("lastGame");
  const savedNickname = localStorage.getItem("lastNickname");

  const handleRejoin = async () => {
    await fetch(`/api/games/rejoin`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ savedGame, savedNickname }),
    });

    window.location.href = `/game/${savedGame}`;
  };

  return (
    <Dialog open={open}>
      <div>
        <h3>Bạn có muốn quay lại game?</h3>
        <p>Game: {savedGame}</p>
        <p>Tên: {savedNickname}</p>
        <Button onClick={handleRejoin}>Quay lại</Button>
        <Button
          onClick={() => {
            localStorage.removeItem("lastGame");
            localStorage.removeItem("lastNickname");
            setOpen(false);
          }}
        >
          Tạo game mới
        </Button>
      </div>
    </Dialog>
  );
}
