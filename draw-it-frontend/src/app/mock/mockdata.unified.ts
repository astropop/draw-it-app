// app/lib/mockData.unified.ts (UPDATE TOÀN BỘ FILE)

import {
  PlayerDTO,
  GameListItemDTO,
  GameStatus,
  GameSpectatorDTO,
  GameResponseDTO,
  GuessDTO,
  RoundSpectatorDTO,
} from "../lib/game.type";

// ============================================
// GAME 1: WAITING - Host có nút Start
// ============================================

const GAME1_CODE = "WAIT1234";
const GAME1_CREATED_AT = "2025-11-14T01:00:00.000Z";

const game1Players: PlayerDTO[] = [
  {
    nickname: "John",
    score: 0,
    isHost: true,
    sessionId: "game1-session-001",
    joinedOrder: 0,
  },
  {
    nickname: "Alice",
    score: 0,
    isHost: false,
    sessionId: "game1-session-002",
    joinedOrder: 1,
  },
  {
    nickname: "Bob",
    score: 0,
    isHost: false,
    sessionId: "game1-session-003",
    joinedOrder: 2,
  },
];

export const game1Lobby: GameListItemDTO = {
  gameCode: GAME1_CODE,
  theme: "Animals",
  status: GameStatus.WAITING,
  playerCount: 3,
  createdAt: GAME1_CREATED_AT,
  startedAt: undefined,
  finishedAt: undefined,
};

export const game1Spectator: GameSpectatorDTO = {
  gameCode: GAME1_CODE,
  theme: "Animals",
  status: GameStatus.WAITING,
  currentRound: 0,
  maxRounds: 3,
  players: game1Players,
  currentRoundInfo: undefined,
  allRounds: undefined,
};

// ✅ Host view - Có nút Start
export const game1RoomAsHost: GameResponseDTO = {
  gameId: 1,
  gameCode: GAME1_CODE,
  sessionId: "game1-session-001", // John's session
  status: GameStatus.WAITING,
  theme: "Animals",
  maxRounds: 3,
  currentRound: 0,
  drawingTime: 120,
  guessingTime: 60,
  words: ["elephant", "tiger", "dolphin", "penguin", "giraffe"],
  isHost: true, // ✅ Host có nút Start
  players: game1Players,
};

// ✅ Player view - Chỉ đợi
export const game1RoomAsPlayer: GameResponseDTO = {
  ...game1RoomAsHost,
  sessionId: "game1-session-002", // Alice's session
  isHost: false, // ✅ Không có nút Start, chỉ đợi
};

// ============================================
// GAME 2: IN_PROGRESS - Đang chơi
// ============================================

const GAME2_CODE = "PLAY5678";
const GAME2_CREATED_AT = "2025-11-14T00:30:00.000Z";
const GAME2_STARTED_AT = "2025-11-14T00:35:00.000Z";

const game2Players: PlayerDTO[] = [
  {
    nickname: "Emma",
    score: 185,
    isHost: true,
    sessionId: "game2-session-001",
    joinedOrder: 0,
  },
  {
    nickname: "Liam",
    score: 220,
    isHost: false,
    sessionId: "game2-session-002",
    joinedOrder: 1,
  },
  {
    nickname: "Olivia",
    score: 145,
    isHost: false,
    sessionId: "game2-session-003",
    joinedOrder: 2,
  },
  {
    nickname: "Noah",
    score: 90,
    isHost: false,
    sessionId: "game2-session-004",
    joinedOrder: 3,
  },
];

const game2CurrentGuesses: GuessDTO[] = [
  {
    playerNickname: "Emma",
    guess: "pizza",
    isCorrect: true,
    pointsEarned: 95,
    submittedAt: "2025-11-14T00:42:15.000Z",
  },
  {
    playerNickname: "Olivia",
    guess: "pizza",
    isCorrect: true,
    pointsEarned: 82,
    submittedAt: "2025-11-14T00:42:28.000Z",
  },
];

export const game2Lobby: GameListItemDTO = {
  gameCode: GAME2_CODE,
  theme: "Food",
  status: GameStatus.IN_PROGRESS,
  playerCount: 4,
  createdAt: GAME2_CREATED_AT,
  startedAt: GAME2_STARTED_AT,
  finishedAt: undefined,
};

export const game2Spectator: GameSpectatorDTO = {
  gameCode: GAME2_CODE,
  theme: "Food",
  status: GameStatus.IN_PROGRESS,
  currentRound: 2,
  maxRounds: 5,
  players: game2Players,
  currentRoundInfo: {
    roundNumber: 2,
    drawer: "Liam",
    selectedWord: undefined,
    drawingData:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
    containsText: false,
    guesses: game2CurrentGuesses,
  },
  allRounds: undefined,
};

// ✅ MY TURN - Chọn từ để vẽ (Word Selection Phase)
export const game2RoomWordSelection: GameResponseDTO = {
  gameId: 2,
  gameCode: GAME2_CODE,
  sessionId: "game2-session-002", // Liam's turn
  status: GameStatus.IN_PROGRESS,
  theme: "Food",
  maxRounds: 5,
  currentRound: 2,
  drawingTime: 180,
  guessingTime: 90,
  words: ["pizza", "sushi", "burger", "pasta", "salad"],
  isHost: false,
  players: game2Players,
  // ✅ Chưa có currentRoundId vì chưa chọn từ
  currentDrawerSessionId: "game2-session-002",
};

// ✅ MY TURN - Đang vẽ (Drawing Phase)
export const game2RoomAsDrawer: GameResponseDTO = {
  gameId: 2,
  gameCode: GAME2_CODE,
  sessionId: "game2-session-002", // Liam's session
  status: GameStatus.IN_PROGRESS,
  theme: "Food",
  maxRounds: 5,
  currentRound: 2,
  drawingTime: 180,
  guessingTime: 90,
  words: ["pizza", "sushi", "burger", "pasta", "salad"],
  isHost: false,
  players: game2Players,
  currentDrawerSessionId: "game2-session-002",
};

// ✅ OTHERS TURN - Đang đoán (Guessing Phase)
export const game2RoomAsGuesser: GameResponseDTO = {
  ...game2RoomAsDrawer,
  sessionId: "game2-session-001", // Emma's session
  isHost: true,
  currentDrawerSessionId: "game2-session-002",
};

// ============================================
// GAME 3: FINISHED
// ============================================

const GAME3_CODE = "DONE9999";
const GAME3_CREATED_AT = "2025-11-14T00:00:00.000Z";
const GAME3_STARTED_AT = "2025-11-14T00:05:00.000Z";
const GAME3_FINISHED_AT = "2025-11-14T00:25:00.000Z";

const game3Players: PlayerDTO[] = [
  {
    nickname: "Winner",
    score: 285,
    isHost: true,
    sessionId: "game3-session-001",
    joinedOrder: 0,
  },
  {
    nickname: "SecondPlace",
    score: 265,
    isHost: false,
    sessionId: "game3-session-002",
    joinedOrder: 1,
  },
  {
    nickname: "ThirdPlace",
    score: 195,
    isHost: false,
    sessionId: "game3-session-003",
    joinedOrder: 2,
  },
];

const game3AllRounds: RoundSpectatorDTO[] = [
  {
    roundNumber: 1,
    drawer: "Winner",
    selectedWord: "basketball",
    drawingData:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
    containsText: false,
    guesses: [
      {
        playerNickname: "SecondPlace",
        guess: "basketball",
        isCorrect: true,
        pointsEarned: 98,
        submittedAt: "2025-11-14T00:08:12.000Z",
      },
      {
        playerNickname: "ThirdPlace",
        guess: "ball",
        isCorrect: false,
        pointsEarned: 0,
        submittedAt: "2025-11-14T00:08:35.000Z",
      },
    ],
  },
  {
    roundNumber: 2,
    drawer: "SecondPlace",
    selectedWord: "tennis",
    drawingData:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
    containsText: false,
    guesses: [
      {
        playerNickname: "Winner",
        guess: "tennis",
        isCorrect: true,
        pointsEarned: 92,
        submittedAt: "2025-11-14T00:13:23.000Z",
      },
      {
        playerNickname: "ThirdPlace",
        guess: "tennis",
        isCorrect: true,
        pointsEarned: 70,
        submittedAt: "2025-11-14T00:13:55.000Z",
      },
    ],
  },
  {
    roundNumber: 3,
    drawer: "ThirdPlace",
    selectedWord: "soccer",
    drawingData:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
    containsText: true,
    guesses: [
      {
        playerNickname: "Winner",
        guess: "soccer",
        isCorrect: true,
        pointsEarned: 95,
        submittedAt: "2025-11-14T00:18:18.000Z",
      },
      {
        playerNickname: "SecondPlace",
        guess: "soccer",
        isCorrect: true,
        pointsEarned: 75,
        submittedAt: "2025-11-14T00:18:42.000Z",
      },
    ],
  },
];

export const game3Lobby: GameListItemDTO = {
  gameCode: GAME3_CODE,
  theme: "Sports",
  status: GameStatus.FINISHED,
  playerCount: 3,
  createdAt: GAME3_CREATED_AT,
  startedAt: GAME3_STARTED_AT,
  finishedAt: GAME3_FINISHED_AT,
};

export const game3Spectator: GameSpectatorDTO = {
  gameCode: GAME3_CODE,
  theme: "Sports",
  status: GameStatus.FINISHED,
  currentRound: 3,
  maxRounds: 3,
  players: game3Players,
  currentRoundInfo: undefined,
  allRounds: game3AllRounds,
};

export const game3Room: GameResponseDTO = {
  gameId: 3,
  gameCode: GAME3_CODE,
  sessionId: "game3-session-001",
  status: GameStatus.FINISHED,
  theme: "Sports",
  maxRounds: 3,
  currentRound: 3,
  drawingTime: 120,
  guessingTime: 60,
  words: ["basketball", "tennis", "soccer", "volleyball", "hockey"],
  isHost: true,
  players: game3Players,
};

// ============================================
// COMBINED EXPORTS
// ============================================

export const mockGamesLobby: GameListItemDTO[] = [
  game1Lobby,
  game2Lobby,
  game3Lobby,
];

export const mockGamesByCode = {
  [GAME1_CODE]: {
    lobby: game1Lobby,
    spectator: game1Spectator,
    roomAsHost: game1RoomAsHost,
    roomAsPlayer: game1RoomAsPlayer,
  },
  [GAME2_CODE]: {
    lobby: game2Lobby,
    spectator: game2Spectator,
    roomWordSelection: game2RoomWordSelection, // ✅ NEW
    roomAsDrawer: game2RoomAsDrawer,
    roomAsGuesser: game2RoomAsGuesser,
  },
  [GAME3_CODE]: {
    lobby: game3Lobby,
    spectator: game3Spectator,
    room: game3Room,
  },
};

export function getMockGameByCode(code: string) {
  return mockGamesByCode[code as keyof typeof mockGamesByCode];
}

export function getMockGameRoomAsNewPlayer(
  gameCode: string,
  nickname: string
): GameResponseDTO | null {
  const mockGame = getMockGameByCode(gameCode);

  if (!mockGame) {
    return null;
  }

  const baseData =
    "roomAsHost" in mockGame
      ? mockGame.roomAsHost
      : "roomAsDrawer" in mockGame
      ? mockGame.roomAsDrawer
      : mockGame.room;

  if (!baseData) {
    return null;
  }

  const newSessionId = `${gameCode}-session-${Date.now()}`;

  const newPlayer: PlayerDTO = {
    nickname,
    score: 0,
    isHost: false,
    sessionId: newSessionId,
    joinedOrder: baseData.players.length,
  };

  return {
    ...baseData,
    sessionId: newSessionId,
    isHost: false,
    players: [...baseData.players, newPlayer],
  };
}
