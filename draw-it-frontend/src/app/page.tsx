import { getGameList } from "./lib/api/GetGameList/fetcher";
import styles from "./page.module.css";
import GameLobby from "./ui/components/GameLobby";
import HomePage from "./ui/components/HomePage";

export default async function Home() {
  const games = await getGameList();

  return (
    <div className={styles.page}>
      <HomePage />

      <GameLobby initialGames={games} />
    </div>
  );
}
