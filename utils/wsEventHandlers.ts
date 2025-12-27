/**
 * WebSocket Event Handlers
 *
 * Modular event handlers extracted from GameProvider.
 * Each handler is a pure function that takes dependencies and returns a handler function.
 */

import { NextRouter } from 'next/router';
import { ReactNode } from 'react';
import {
  CloseEvent as RWSCloseEvent,
  ErrorEvent as RWSErrorEvent,
} from 'reconnecting-websocket/dist/events';
import {
  isGameStarted,
  setGameStarted,
  hasResults,
  setResults as setGlobalResults,
  getUserId as getGlobalUserId,
  setUserId as setGlobalUserId,
  setConnectionClosed,
} from './gameState';
import { WSEventType } from '../types/game';

// Types for dependencies
export interface NotificationActions {
  openNotification: (config: NotificationConfig) => void;
  closeNotification: () => void;
}

export interface NotificationConfig {
  title?: string;
  description?: ReactNode;
  dark?: boolean;
  icon?: ReactNode;
  iconColor?: string;
  footer?: ReactNode;
  isWinner?: boolean;
}

export interface StateSetters {
  setTimer: (timer: number) => void;
  setTotalSeconds: (seconds: number) => void;
  setUserSocketIdle: (data: unknown) => void;
  setUserInfo: (info: unknown) => void;
  setIsBackendReady: (ready: boolean) => void;
  setRoomId: (id: string) => void;
  setResults: (results: unknown) => void;
  setRoomInfo: (info: unknown) => void;
  setPlayers: (players: unknown) => void;
  setPlayingAgain: (playing: boolean | null) => void;
  setIsAlreadyConnected: (connected: boolean) => void;
  setGameState: (state: unknown) => void;
}

export interface WSProviderType {
  send: (data: string) => void;
  close: () => void;
}

export interface UIActions {
  quit: () => void;
  reload: () => void;
  newGame: () => void;
  playStartGameSound: () => void;
}

export interface HandlerDependencies {
  notifications: NotificationActions;
  stateSetters: StateSetters;
  router: NextRouter;
  wsProvider: WSProviderType;
  uiActions: UIActions;
  getGameState: () => unknown;
  renderWarningIcon: () => ReactNode;
  renderQuitButton: () => ReactNode;
  renderNewGameButton: () => ReactNode;
  renderReloadButton: () => ReactNode;
  renderDashboardButton: () => ReactNode;
  renderGameEndedNotification: () => ReactNode;
}

// Event data types
interface TimerEventData {
  secondsLeft: number;
  totalSeconds: number;
}

interface UserSocketIdleEventData {
  userId: string;
}

interface UserInfoEventData {
  userId: string;
  inRoomId?: string;
  inGameId?: string;
}

interface CreateRoomEventData {
  roomId: string;
}

interface CloseRoomEventData {
  reason?: string;
  ownderId?: string;
}

interface RoomEventData {
  roomId?: string;
  roomUsers?: unknown[];
  error?: {
    errorCode?: number;
    message?: string;
  };
}

interface GameEventData {
  state?: string;
  error?: {
    message?: string;
  };
}

interface QuitRoomEventData {
  reason?: string;
}

interface WSEvent {
  event: WSEventType | string;
  data: unknown;
}

/**
 * Handle timer event
 */
export function handleTimer(
  data: TimerEventData,
  setters: Pick<StateSetters, 'setTimer' | 'setTotalSeconds'>
): void {
  setters.setTimer(data.secondsLeft);
  setters.setTotalSeconds(data.totalSeconds);
}

/**
 * Handle user socket idle event
 */
export function handleUserSocketIdle(
  data: UserSocketIdleEventData,
  setters: Pick<StateSetters, 'setUserSocketIdle'>
): void {
  setters.setUserSocketIdle(data);
}

/**
 * Handle user info event
 */
export function handleUserInfo(
  data: UserInfoEventData,
  setters: Pick<StateSetters, 'setUserInfo' | 'setIsBackendReady'>
): void {
  setters.setUserInfo(data);
  setGlobalUserId(data.userId);
  setters.setIsBackendReady(true);
}

/**
 * Handle create room event
 */
export function handleCreateRoom(
  data: CreateRoomEventData,
  setters: Pick<StateSetters, 'setRoomId'>,
  wsProvider: WSProviderType
): void {
  console.log('create-room happens');
  setters.setRoomId(data.roomId);
  wsProvider.send(
    JSON.stringify({
      event: 'room-info',
      data: {},
    })
  );
}

/**
 * Handle close room event (timeout or vote failed)
 */
export function handleCloseRoomTimeout(
  data: CloseRoomEventData,
  uiActions: Pick<UIActions, 'quit'>
): boolean {
  if (data.reason === 'TIMEOUT' || data.reason === 'NEXT_GAME_VOTE_FAILED') {
    uiActions.quit();
    return true;
  }
  return false;
}

/**
 * Handle close room event (by owner)
 */
export function handleCloseRoomByOwner(
  data: CloseRoomEventData,
  notifications: NotificationActions,
  renderWarningIcon: () => ReactNode,
  renderQuitButton: () => ReactNode
): void {
  if (data.ownderId && data.ownderId !== getGlobalUserId() && !hasResults()) {
    notifications.openNotification({
      title: 'Ooopps',
      description: 'This game has been closed by host',
      dark: false,
      icon: renderWarningIcon(),
      iconColor: '#FF6F41',
      footer: renderQuitButton(),
    });
  }
}

/**
 * Handle room updated event during play-again flow
 */
export function handleRoomUpdatedWithResults(
  data: RoomEventData,
  setters: Pick<StateSetters, 'setResults' | 'setRoomInfo' | 'setPlayers' | 'setPlayingAgain'>,
  notifications: NotificationActions,
  router: NextRouter
): boolean {
  if (hasResults()) {
    setters.setResults(null);
    notifications.closeNotification();
    setters.setRoomInfo(data);
    setters.setPlayers(data.roomUsers);
    setters.setPlayingAgain(null);
    setGlobalResults(false);
    router.push(`/game/${data.roomId}`);
    return true;
  }
  return false;
}

/**
 * Handle room updated or room info event
 */
export function handleRoomUpdate(
  data: RoomEventData,
  setters: Pick<StateSetters, 'setRoomInfo' | 'setPlayers'>
): void {
  setters.setRoomInfo(data);
  if (data.roomUsers) {
    console.log('Room updated: ', data);
    setters.setPlayers(data.roomUsers);
  }
}

/**
 * Handle join room event
 */
export function handleJoinRoom(
  data: RoomEventData,
  notifications: NotificationActions,
  wsProvider: WSProviderType,
  router: NextRouter,
  renderWarningIcon: () => ReactNode,
  renderNewGameButton: () => ReactNode,
  renderGameEndedNotification: () => ReactNode
): void {
  if (
    data.error?.errorCode === 403 &&
    data.error?.message?.startsWith('No valid server instance for the room')
  ) {
    notifications.openNotification({
      description: renderGameEndedNotification(),
      dark: false,
      icon: renderWarningIcon(),
      iconColor: '#FF6F41',
      footer: renderNewGameButton(),
    });
    router.push('/dashboard');
  }
  wsProvider.send(
    JSON.stringify({
      event: 'room-info',
      data: {},
    })
  );
}

/**
 * Handle quit room event (kicked by owner)
 */
export function handleQuitRoom(
  data: QuitRoomEventData,
  notifications: NotificationActions,
  renderQuitButton: () => ReactNode
): void {
  if (data.reason === 'KICKED_BY_ROOM_OWNER') {
    notifications.openNotification({
      title: 'You were kicked!',
      dark: true,
      iconColor: 'blue',
      footer: renderQuitButton(),
    });
  }
}

/**
 * Handle error: Joining while hosting
 */
export function handleJoiningWhileHostingError(
  data: GameEventData,
  notifications: NotificationActions,
  renderWarningIcon: () => ReactNode,
  renderQuitButton: () => ReactNode
): boolean {
  if (data.error?.message === 'Joining while hosting a game is forbidden') {
    notifications.openNotification({
      title: 'Sorry',
      description: 'Cannot join rooms while hosting a game. Quit the game and try again!',
      dark: false,
      icon: renderWarningIcon(),
      iconColor: '#FF6F41',
      footer: renderQuitButton(),
    });
    return true;
  }
  return false;
}

/**
 * Handle game results event
 */
export function handleGameResults(
  data: unknown,
  setters: Pick<StateSetters, 'setResults'>
): void {
  console.log('game-results', data);
  setters.setResults(data);
  setGlobalResults(true);
}

/**
 * Handle game info event
 */
export function handleGameInfo(
  data: GameEventData,
  setters: Pick<StateSetters, 'setGameState'>,
  getGameState: () => unknown,
  wsProvider: WSProviderType,
  notifications: NotificationActions,
  renderQuitButton: () => ReactNode
): void {
  if (data.state === 'ended' && hasResults()) {
    return;
  }

  const currentState = getGameState();
  setters.setGameState({ ...currentState as object, ...data });

  if (data.state === 'ended' && !hasResults()) {
    wsProvider.send(
      JSON.stringify({
        event: 'game-results',
        data: {},
      })
    );
    notifications.openNotification({
      title: 'Game Over!',
      dark: true,
      iconColor: 'blue',
      footer: renderQuitButton(),
    });
  }

  console.log(data.state);
  console.log('game-info": ', data);
}

/**
 * Handle game updated event
 */
export function handleGameUpdated(
  data: GameEventData,
  setters: Pick<StateSetters, 'setGameState'>,
  notifications: NotificationActions,
  router: NextRouter,
  uiActions: Pick<UIActions, 'playStartGameSound'>
): void {
  setters.setGameState({ ...data });

  setTimeout(() => {
    if (data.state === 'started') {
      notifications.closeNotification();
      if (!isGameStarted() && !hasResults()) {
        uiActions.playStartGameSound();
        setGameStarted(true);
      }
      if (!window.location.pathname.split('?')[0].endsWith('/dashboard')) {
        router.push('/play');
      }
    }
  }, 0);

  console.log('game-updated": ', data);
}

/**
 * Handle player must be in room error
 */
export function handlePlayerNotInRoomError(
  data: GameEventData,
  router: NextRouter
): boolean {
  if (data.error?.message === 'Player must be in a room') {
    router.push('/dashboard');
    return true;
  }
  return false;
}

/**
 * Handle WebSocket close event
 */
export function handleWSClose(
  code: number,
  setters: Pick<StateSetters, 'setIsAlreadyConnected'>,
  notifications: NotificationActions,
  wsProvider: WSProviderType,
  renderWarningIcon: () => ReactNode,
  renderReloadButton: () => ReactNode
): void {
  // Don't reconnect if there's already a connection opened in the backend
  if (code === 4000) {
    if (!localStorage.getItem('adding-metamask')) {
      setters.setIsAlreadyConnected(true);
    }
    wsProvider.close();
  }

  // Don't reconnect if there's a new connection opened in the backend
  if (code === 4001) {
    notifications.openNotification({
      title: 'Already connected!',
      description: 'You are already in a lobby or a game in an another browser or tab.',
      dark: false,
      footer: renderReloadButton(),
      icon: renderWarningIcon(),
      iconColor: '#FF6F41',
    });
    setConnectionClosed(true);
    wsProvider.close();
  }
}

/**
 * Create the main WebSocket message handler
 */
export function createWSMessageHandler(deps: HandlerDependencies): (event: MessageEvent) => void {
  return function handleMessage({ data }: MessageEvent) {
    deps.stateSetters.setIsAlreadyConnected(false);

    const event: WSEvent = JSON.parse(data);

    if (event.event === 'pong') {
      return;
    }

    if (event.event !== 'timer') {
      console.log('Game Provider WS event:', event);
    }

    // Timer event
    if (event.event === 'timer') {
      handleTimer(event.data as TimerEventData, deps.stateSetters);
      return;
    }

    // User socket idle event
    if (event.event === 'user-socket-idle') {
      handleUserSocketIdle(event.data as UserSocketIdleEventData, deps.stateSetters);
      return;
    }

    // Handle player not in room error
    if (handlePlayerNotInRoomError(event.data as GameEventData, deps.router)) {
      return;
    }

    // Log choose-nft-cards
    if (event.event === 'choose-nft-cards') {
      console.log('choose-nft-cards sub: ', event);
    }

    // User info event
    if (event.event === 'user-info') {
      handleUserInfo(event.data as UserInfoEventData, deps.stateSetters);
    }

    // Create room event
    if (event.event === 'create-room') {
      handleCreateRoom(event.data as CreateRoomEventData, deps.stateSetters, deps.wsProvider);
    }

    // Close room event (timeout)
    if (event.event === 'close-room') {
      if (handleCloseRoomTimeout(event.data as CloseRoomEventData, deps.uiActions)) {
        return;
      }
    }

    // Log next-game
    if (event.event === 'next-game') {
      console.log('next-game', event);
    }

    // Room updated with results (play again)
    if (event.event === 'room-updated') {
      if (handleRoomUpdatedWithResults(
        event.data as RoomEventData,
        deps.stateSetters,
        deps.notifications,
        deps.router
      )) {
        return;
      }
    }

    // Close room by owner
    if (event.event === 'close-room') {
      handleCloseRoomByOwner(
        event.data as CloseRoomEventData,
        deps.notifications,
        deps.renderWarningIcon,
        deps.renderQuitButton
      );
    }

    // Room updated or room info
    if (event.event === 'room-updated' || event.event === 'room-info') {
      handleRoomUpdate(event.data as RoomEventData, deps.stateSetters);
    }

    // Join room
    if (event.event === 'join-room') {
      handleJoinRoom(
        event.data as RoomEventData,
        deps.notifications,
        deps.wsProvider,
        deps.router,
        deps.renderWarningIcon,
        deps.renderNewGameButton,
        deps.renderGameEndedNotification
      );
    }

    // Quit room (kicked)
    if (event.event === 'quit-room') {
      handleQuitRoom(
        event.data as QuitRoomEventData,
        deps.notifications,
        deps.renderQuitButton
      );
    }

    // Handle no valid server instance error
    const eventData = event.data as GameEventData;
    if (eventData.error?.message === 'No valid server instance for the room') {
      return;
    }

    // Handle joining while hosting error
    if (handleJoiningWhileHostingError(
      eventData,
      deps.notifications,
      deps.renderWarningIcon,
      deps.renderQuitButton
    )) {
      return;
    }

    // Game results
    if (event.event === 'game-results') {
      handleGameResults(event.data, deps.stateSetters);
    }

    // Game info
    if (event.event === 'game-info') {
      handleGameInfo(
        eventData,
        deps.stateSetters,
        deps.getGameState,
        deps.wsProvider,
        deps.notifications,
        deps.renderQuitButton
      );
    }

    // Game updated
    if (event.event === 'game-updated') {
      handleGameUpdated(
        eventData,
        deps.stateSetters,
        deps.notifications,
        deps.router,
        deps.uiActions
      );
    }
  };
}

/**
 * Create the WebSocket close handler
 */
export function createWSCloseHandler(deps: HandlerDependencies): (event: RWSCloseEvent) => void {
  return function handleClose(e: RWSCloseEvent) {
    console.log('on close: ' + e.code);
    handleWSClose(
      e.code,
      deps.stateSetters,
      deps.notifications,
      deps.wsProvider,
      deps.renderWarningIcon,
      deps.renderReloadButton
    );
  };
}

/**
 * Create the WebSocket error handler
 */
export function createWSErrorHandler(): (event: RWSErrorEvent) => void {
  return function handleError(event: RWSErrorEvent) {
    console.log('WebSocket error: ', event);
  };
}
