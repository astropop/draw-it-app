import { getGame } from "@/app/lib/api";
import { getMockGameByCode } from "@/app/mock/mockdata.unified";
import GameRoom from "@/app/ui/components/GameRoom";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

async function getGameData(code: string) {
  // Server-side fetch

  if (USE_MOCK) {
    // Remove suffix for lookup
    const baseCode = code.split("_")[0];
    const mockGame = getMockGameByCode(baseCode);
    if (!mockGame) {
      notFound();
    }

    // ✅ Support different views based on code suffix
    // WAITING games
    if ("roomAsHost" in mockGame) {
      if (code.endsWith("_HOST") || code.endsWith("_PLAYER")) {
        return code.endsWith("_HOST")
          ? mockGame.roomAsHost
          : mockGame.roomAsPlayer;
      }
      // Default to host for WAITING games
      return mockGame.roomAsHost;
    }

    // IN_PROGRESS games
    if ("roomAsDrawer" in mockGame) {
      if (code.endsWith("_WORD")) {
        return mockGame.roomWordSelection;
      }
      if (code.endsWith("_DRAWER")) {
        return mockGame.roomAsDrawer;
      }
      if (code.endsWith("_GUESSER")) {
        return mockGame.roomAsGuesser;
      }
      // Default to drawer for IN_PROGRESS games
      return mockGame.roomAsDrawer;
    }

    // FINISHED games
    if ("room" in mockGame) {
      return mockGame.room;
    }

    notFound();
  }

  const cookieStore = await cookies();
  const playerSessionId = cookieStore.get("sessionId")?.value;

  const response = await getGame(code, playerSessionId);

  if (!response) {
    notFound();
  }

  return response;
}

export default async function GamePage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = await params;
  const gameData = await getGameData(code);

  // Redirect to spectator if game finished
  if (gameData.status === "FINISHED") {
    redirect(`/spectate/${params.code}`);
  }

  const cookieStore = await cookies();
  const playerSessionId = cookieStore.get("sessionId")?.value;

  return <GameRoom gameData={gameData} currentSessionId={playerSessionId} />;
}

export const metadata: Metadata = {
  title: "Draw-it - Play Game",
};
