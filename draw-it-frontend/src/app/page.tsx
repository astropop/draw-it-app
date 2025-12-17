import { getGameList } from "./lib/api/GetGameList/fetcher";
import { GameListRequestDto } from "./lib/api/GetGameList/type";
import styles from "./page.module.css";
import GameLobby from "./ui/components/GameLobby";
import HomePage from "./ui/components/HomePage";

export default async function Home() {
  const pageSize = 8;
  const defaultVals = {
    page: 1,
    sort: "desc",
    pageSize,
  } as GameListRequestDto;

  const games = await getGameList(defaultVals);

  return (
    <div className={styles.page}>
      <HomePage />

      <GameLobby initialGames={games} pageSize={pageSize} />
    </div>
  );
}
