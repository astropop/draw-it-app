import { mockGamesLobby } from "./mock/mockdata.unified";
import styles from "./page.module.css";
import GameLobby from "./ui/components/GameLobby";
import HomePage from "./ui/components/HomePage";

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

export default async function Home() {
  const games = await getGames();

  return (
    <div className={styles.page}>
      <HomePage />

      <GameLobby initialGames={games} />
    </div>
  );
}
