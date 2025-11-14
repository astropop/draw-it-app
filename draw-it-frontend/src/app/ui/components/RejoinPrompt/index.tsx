"use client";

import { useEffect, useState } from "react";
import { Button, Dialog, TextField } from "@mui/material";

export default function RejoinPrompt() {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [gameCode, setGameCode] = useState("");

  useEffect(() => {
    // Check localStorage
    const savedGame = localStorage.getItem("lastGame");
    const savedNickname = localStorage.getItem("lastNickname");

    if (savedGame && savedNickname) {
      setGameCode(savedGame);
      setNickname(savedNickname);
      setOpen(true);
    }
  }, []);

  const handleRejoin = async () => {
    await fetch(`/api/games/rejoin`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ gameCode, nickname }),
    });

    window.location.href = `/game/${gameCode}`;
  };

  return (
    <Dialog open={open}>
      <div>
        <h3>Bạn có muốn quay lại game?</h3>
        <p>Game: {gameCode}</p>
        <p>Tên: {nickname}</p>
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
