import { getGame } from "@/app/lib/api/GetGame/fetcher";
import { GameStatus } from "@/app/lib/game.type";
import GameRoom from "@/app/ui/components/GameRoom";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

type GamePageProps = { params: Promise<{ code: string }> };

const getGameData = cache(async (code: string) => {
  const response = await getGame(code);

  if (!response || !response.gameCode) {
    redirect(`/`);
  }

  return response;
});

export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  const code = (await params).code;

  // fetch post information
  const gameData = await getGameData(code);

  return {
    title: `Draw-it - Game Room - (Theme: ${gameData.theme})`,
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const code = (await params).code;
  const gameData = await getGameData(code);

  // Redirect to spectator if game finished
  if (gameData.status === GameStatus.FINISHED) {
    redirect(`/spectate/${code}`);
  }

  return <GameRoom gameData={gameData} />;
}
