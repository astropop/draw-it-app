// Spectate

import { spectateGame } from "@/app/lib/api/SpectateGame/fetcher";
import GameSpectator from "@/app/ui/components/GameSpectator";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

type SpectatePageProps = { params: Promise<{ code: string }> };

const getGameData = cache(async (code: string) => {
  const response = await spectateGame(code);

  if (!response) {
    notFound();
  }

  return response;
});

export default async function SpectatePage({ params }: SpectatePageProps) {
  const code = (await params).code;
  const gameData = await getGameData(code);

  return <GameSpectator initialData={gameData} />;
}

export async function generateMetadata({
  params,
}: SpectatePageProps): Promise<Metadata> {
  const code = (await params).code;

  // fetch post information
  const gameData = await getGameData(code);

  return {
    title: `Draw-it - Spectate Room - (Theme: ${gameData.theme})`,
  };
}
