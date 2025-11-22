import { gameApi } from "./lib/api";
import { mockGamesLobby } from "./mock/mockdata.unified";
import styles from "./page.module.css";
import GameLobby from "./ui/components/GameLobby";
import HomePage from "./ui/components/HomePage";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const getGames = async () => {
  if (USE_MOCK) {
    return mockGamesLobby;
  }
  // return arrLocal;
  const response = await gameApi.getGameList();

  if (!response) {
    return [];
  }

  return response;
};

export default async function Home() {
  const games = await getGames();

  return (
    <div className={styles.page}>
      <HomePage />

      <GameLobby initialGames={games} />
    </div>
  );
}
