// Spectate

import { getMockGameByCode } from "@/app/mock/mockdata.unified";
import GameSpectator from "@/app/ui/components/GameSpectator";
import { notFound } from "next/navigation";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

async function getGameData(code: string) {
  if (USE_MOCK) {
    const mockGame = getMockGameByCode(code);
    if (!mockGame) {
      notFound();
    }
    return mockGame.spectator;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/games/${code}/spectate`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    // throw new Error("Game not found");
    notFound();
  }

  return await response.json();
}

export default async function SpectatePage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = await params;
  const gameData = await getGameData(code);

  return <GameSpectator initialData={gameData} />;
}
