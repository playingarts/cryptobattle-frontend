import { Dispatch, SetStateAction, MutableRefObject } from "react";
import { NextRouter } from "next/router";
import {
  GameUpdatedData,
  RoomUser,
  RoomInfo,
  GameResults,
  User,
  UserSocketIdleData,
  GamePlayer,
} from "../types/game";

export interface WSEventHandlerDeps {
  // State setters
  setResults: Dispatch<SetStateAction<GameResults | null>>;
  setPlayers: Dispatch<SetStateAction<RoomUser[]>>;
  setPlayersGame: Dispatch<SetStateAction<GamePlayer[]>>;
  setPlayingAgain: Dispatch<SetStateAction<boolean>>;
  setTimer: Dispatch<SetStateAction<number>>;
  setTotalSeconds: Dispatch<SetStateAction<number>>;
  setUserInfo: Dispatch<SetStateAction<User | null>>;
  setRoomInfo: Dispatch<SetStateAction<RoomInfo | null>>;
  setRoomId: Dispatch<SetStateAction<string>>;
  setGameState: Dispatch<SetStateAction<GameUpdatedData | null>>;
  setUserSocketIdle: Dispatch<SetStateAction<UserSocketIdleData | null>>;
  setIsBackendReady: Dispatch<SetStateAction<boolean>>;
  setIsAlreadyConnected: Dispatch<SetStateAction<boolean>>;

  // Refs
  gameStartedRef: MutableRefObject<boolean>;
  hasResultsRef: MutableRefObject<boolean>;
  currentUserIdRef: MutableRefObject<string>;
  gameStateRef: MutableRefObject<GameUpdatedData | null>;

  // Other deps
  router: NextRouter;
  WSProvider: WebSocket | null;
  gameState: GameUpdatedData | null;
  openNotification: (config: any) => void;
  closeNotification: () => void;
  quit: () => void;
  playStartGameSound: () => void;
}

export type WSEventType =
  | "pong"
  | "timer"
  | "user-socket-idle"
  | "user-info"
  | "create-room"
  | "close-room"
  | "next-game"
  | "room-updated"
  | "room-info"
  | "join-room"
  | "quit-room"
  | "choose-nft-cards"
  | "game-results"
  | "game-info"
  | "game-updated";

export interface WSEvent {
  event: WSEventType;
  data: any;
}

export function handlePong(): void {
  // No-op, just acknowledge
}

export function handleTimer(
  data: { secondsLeft: number; totalSeconds: number },
  deps: Pick<WSEventHandlerDeps, "setTimer" | "setTotalSeconds">
): void {
  deps.setTimer(data.secondsLeft);
  deps.setTotalSeconds(data.totalSeconds);
}

export function handleUserSocketIdle(
  data: UserSocketIdleData,
  deps: Pick<WSEventHandlerDeps, "setUserSocketIdle">
): void {
  deps.setUserSocketIdle(data);
}

export function handleUserInfo(
  data: User & { userId: string },
  deps: Pick<WSEventHandlerDeps, "setUserInfo" | "currentUserIdRef" | "setIsBackendReady">
): void {
  deps.setUserInfo(data);
  deps.currentUserIdRef.current = data.userId;
  deps.setIsBackendReady(true);
}

export function handleCreateRoom(
  data: { roomId: string },
  deps: Pick<WSEventHandlerDeps, "setRoomId" | "WSProvider">
): void {
  deps.setRoomId(data.roomId);
  deps.WSProvider?.send(
    JSON.stringify({
      event: "room-info",
      data: {},
    })
  );
}

export function handleCloseRoom(
  data: { reason: string; ownerId?: string },
  deps: Pick<WSEventHandlerDeps, "quit" | "currentUserIdRef" | "hasResultsRef" | "openNotification">,
  notificationContent: React.ReactNode
): boolean {
  if (data.reason === "TIMEOUT" || data.reason === "NEXT_GAME_VOTE_FAILED") {
    deps.quit();
    return true; // Return early
  }

  if (data.ownerId &&
      data.ownerId !== deps.currentUserIdRef.current &&
      !deps.hasResultsRef.current) {
    deps.openNotification(notificationContent);
  }
  return false;
}

export function handleRoomUpdatedWithResults(
  data: RoomInfo,
  deps: Pick<WSEventHandlerDeps, "setResults" | "closeNotification" | "setRoomInfo" | "setPlayers" | "setPlayingAgain" | "hasResultsRef" | "router">
): boolean {
  if (deps.hasResultsRef.current) {
    deps.setResults(null);
    deps.closeNotification();
    deps.setRoomInfo(data);
    deps.setPlayers(data.roomUsers);
    deps.setPlayingAgain(false);
    deps.hasResultsRef.current = false;
    deps.router.push(`/game/${data.roomId}`);
    return true; // Return early
  }
  return false;
}

export function handleRoomInfo(
  data: RoomInfo,
  deps: Pick<WSEventHandlerDeps, "setRoomInfo" | "setPlayers">
): void {
  deps.setRoomInfo(data);
  if (data.roomUsers) {
    deps.setPlayers(data.roomUsers);
  }
}

export function handleGameResults(
  data: GameResults,
  deps: Pick<WSEventHandlerDeps, "setResults" | "hasResultsRef">
): void {
  deps.setResults(data);
  deps.hasResultsRef.current = true;
}

export function handleGameInfo(
  data: GameUpdatedData & { state: string },
  deps: Pick<WSEventHandlerDeps, "hasResultsRef" | "setGameState" | "gameState" | "WSProvider" | "openNotification" | "quit">,
  notificationContent: React.ReactNode
): boolean {
  if (data.state === "ended" && deps.hasResultsRef.current) {
    return true; // Return early
  }

  deps.setGameState({ ...deps.gameState, ...data } as GameUpdatedData);

  if (data.state === "ended" && !deps.hasResultsRef.current) {
    deps.WSProvider?.send(
      JSON.stringify({
        event: "game-results",
        data: {},
      })
    );
    deps.openNotification(notificationContent);
  }
  return false;
}

export function handleGameUpdated(
  data: GameUpdatedData & { state: string },
  deps: Pick<WSEventHandlerDeps, "setGameState" | "gameStateRef" | "gameStartedRef" | "hasResultsRef" | "closeNotification" | "playStartGameSound" | "router">
): void {
  deps.setGameState({ ...data });
  deps.gameStateRef.current = data;

  setTimeout(() => {
    if (data.state === "started") {
      deps.closeNotification();
      if (!deps.gameStartedRef.current && !deps.hasResultsRef.current) {
        deps.playStartGameSound();
        deps.gameStartedRef.current = true;
      }
      if (!deps.router.pathname.endsWith("/dashboard")) {
        deps.router.push("/play");
      }
    }
  }, 0);
}

export function handleError(
  error: { message: string; errorCode?: number },
  deps: Pick<WSEventHandlerDeps, "router" | "openNotification" | "quit">,
  errorNotifications: {
    noValidServer?: React.ReactNode;
    joiningForbidden?: React.ReactNode;
  }
): boolean {
  if (error.message === "Player must be in a room") {
    deps.router.push("/dashboard");
    return true;
  }

  if (error.message === "No valid server instance for the room") {
    return true;
  }

  if (error.message === "Joining while hosting a game is forbidden") {
    if (errorNotifications.joiningForbidden) {
      deps.openNotification(errorNotifications.joiningForbidden);
    }
    return true;
  }

  return false;
}
