// app/lobby/page.tsx

import { getGameList } from "../lib/api/GetGameList/fetcher";
import GameLobby from "../ui/components/GameLobby";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

async function getGames() {
  const response = await getGameList();

  if (!response) {
    return [];
  }

  return response;
}

export default async function LobbyPage() {
  const games = await getGames();

  return <GameLobby initialGames={games} />;
}
