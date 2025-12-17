import { GameStatus } from "../lib/game.type";

const getStatusColor = (status: string) => {
  switch (status) {
    case GameStatus.WAITING:
      return "info";
    case GameStatus.IN_PROGRESS:
      return "warning";
    case GameStatus.FINISHED:
      return "success";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case GameStatus.WAITING:
      return "Waiting";
    case GameStatus.IN_PROGRESS:
      return "Playing";
    case GameStatus.FINISHED:
      return "Finished";
    default:
      return status;
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("vi-VN");
};

export { getStatusColor, getStatusLabel, formatDate };
