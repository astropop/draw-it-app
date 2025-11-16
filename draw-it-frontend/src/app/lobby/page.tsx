// app/lobby/page.tsx

import { mockGamesLobby } from "../mock/mockdata.unified";
import GameLobby, { arrLocal } from "../ui/components/GameLobby";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

async function getGames() {
  if (USE_MOCK) {
    return mockGamesLobby;
  }
  // return arrLocal;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/games/list`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return [];
  }

  return await response.json();
}

export default async function LobbyPage() {
  const games = await getGames();

  return <GameLobby initialGames={games} />;
}
