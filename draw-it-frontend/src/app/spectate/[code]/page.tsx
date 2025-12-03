// Spectate

import { spectateGame } from "@/app/lib/api/SpectateGame/fetcher";
import GameSpectator from "@/app/ui/components/GameSpectator";
import { notFound } from "next/navigation";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

async function getGameData(code: string) {
  const response = await spectateGame(code);

  if (!response) {
    notFound();
  }

  return response;
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
