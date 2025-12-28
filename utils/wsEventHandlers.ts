/**
 * WebSocket Event Handlers
 *
 * Standardized handlers with signature: handleX(eventData, deps)
 * All handlers receive event data as first param and dependencies object as second.
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

// ============================================================================
// TYPES
// ============================================================================

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

export interface RenderHelpers {
  renderWarningIcon: () => ReactNode;
  renderQuitButton: () => ReactNode;
  renderNewGameButton: () => ReactNode;
  renderReloadButton: () => ReactNode;
  renderDashboardButton: () => ReactNode;
  renderGameEndedNotification: () => ReactNode;
}

/**
 * Dependencies object passed to all handlers
 */
export interface HandlerDeps {
  notifications: NotificationActions;
  stateSetters: StateSetters;
  router: NextRouter;
  wsProvider: WSProviderType;
  uiActions: UIActions;
  render: RenderHelpers;
  getGameState: () => unknown;
}

/**
 * Legacy HandlerDependencies - used by GameProvider
 * Has flat render functions instead of nested render object
 */
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

// ============================================================================
// EVENT DATA TYPES
// ============================================================================

export interface TimerEventData {
  secondsLeft: number;
  totalSeconds: number;
}

export interface UserSocketIdleEventData {
  userId: string;
}

export interface UserInfoEventData {
  userId: string;
  inRoomId?: string;
  inGameId?: string;
}

export interface CreateRoomEventData {
  roomId?: string;
  error?: {
    errorCode?: number;
    message?: string;
  };
}

export interface CloseRoomEventData {
  reason?: string;
  ownderId?: string;
}

export interface RoomEventData {
  roomId?: string;
  roomUsers?: unknown[];
  error?: {
    errorCode?: number;
    message?: string;
  };
}

export interface GameEventData {
  state?: string;
  gameId?: string;
  turnForPlayer?: string;
  allGamePlayers?: unknown[];
  gameTableCards?: unknown;
  allowedUserCardsPlacement?: unknown;
  lastPlayedCard?: unknown;
  error?: {
    message?: string;
  };
}

export interface QuitRoomEventData {
  reason?: string;
  userId?: string;
}

export interface GameResultsEventData {
  winnerPlayersUserIds?: string[];
  playersPoints?: Array<{ odentifier: { odentifier: string }; points: number }>;
}

export interface WSCloseEventData {
  code: number;
}

interface WSEvent {
  event: WSEventType | string;
  data: unknown;
}

// ============================================================================
// HANDLER RESULT TYPE
// ============================================================================

interface HandlerResult {
  handled: boolean;  // If true, stop processing further handlers
}

const CONTINUE: HandlerResult = { handled: false };
const STOP: HandlerResult = { handled: true };

// ============================================================================
// STANDARDIZED HANDLERS - handleX(eventData, deps)
// ============================================================================

/**
 * Handle timer event
 */
export function handleTimer(data: TimerEventData, deps: HandlerDeps): HandlerResult {
  deps.stateSetters.setTimer(data.secondsLeft);
  deps.stateSetters.setTotalSeconds(data.totalSeconds);
  return STOP;
}

/**
 * Handle user socket idle event
 */
export function handleUserSocketIdle(data: UserSocketIdleEventData, deps: HandlerDeps): HandlerResult {
  deps.stateSetters.setUserSocketIdle(data);
  return STOP;
}

/**
 * Handle user info event
 */
export function handleUserInfo(data: UserInfoEventData, deps: HandlerDeps): HandlerResult {
  console.log('[DEBUG user-info] Received:', {
    userId: data.userId,
    inRoomId: data.inRoomId,
    inGameId: data.inGameId,
    currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
  });
  deps.stateSetters.setUserInfo(data);
  setGlobalUserId(data.userId);
  deps.stateSetters.setIsBackendReady(true);
  return CONTINUE;
}

/**
 * Handle create room event
 */
export function handleCreateRoom(data: CreateRoomEventData, deps: HandlerDeps): HandlerResult {
  console.log('[DEBUG create-room] Response received:', data);

  if (data.error) {
    console.log('[DEBUG create-room] ERROR:', data.error.message);
    deps.router.push('/dashboard');
    return CONTINUE;
  }

  if (data.roomId) {
    console.log('[DEBUG create-room] Setting roomId to:', data.roomId);
    deps.stateSetters.setRoomId(data.roomId);
    deps.wsProvider.send(JSON.stringify({ event: 'room-info', data: {} }));
  } else {
    console.log('[DEBUG create-room] WARNING: No roomId in response, redirecting to dashboard');
    deps.router.push('/dashboard');
  }
  return CONTINUE;
}

/**
 * Handle close room event
 */
export function handleCloseRoom(data: CloseRoomEventData, deps: HandlerDeps): HandlerResult {
  // Handle timeout or vote failed
  if (data.reason === 'TIMEOUT' || data.reason === 'NEXT_GAME_VOTE_FAILED') {
    deps.uiActions.quit();
    return STOP;
  }

  // Handle closed by owner
  if (data.ownderId && data.ownderId !== getGlobalUserId() && !hasResults()) {
    deps.notifications.openNotification({
      title: 'Ooopps',
      description: 'This game has been closed by host',
      dark: false,
      icon: deps.render.renderWarningIcon(),
      iconColor: '#FF6F41',
      footer: deps.render.renderQuitButton(),
    });
  }
  return CONTINUE;
}

/**
 * Handle room updated event
 */
export function handleRoomUpdated(data: RoomEventData, deps: HandlerDeps): HandlerResult {
  // Special case: play again flow
  if (hasResults()) {
    deps.stateSetters.setResults(null);
    deps.notifications.closeNotification();
    deps.stateSetters.setRoomInfo(data);
    deps.stateSetters.setPlayers(data.roomUsers);
    deps.stateSetters.setPlayingAgain(null);
    setGlobalResults(false);
    deps.router.push(`/game/${data.roomId}`);
    return STOP;
  }

  // Normal update
  deps.stateSetters.setRoomInfo(data);
  if (data.roomUsers) {
    console.log('Room updated: ', data);
    deps.stateSetters.setPlayers(data.roomUsers);
  }
  return CONTINUE;
}

/**
 * Handle room info event
 */
export function handleRoomInfo(data: RoomEventData, deps: HandlerDeps): HandlerResult {
  deps.stateSetters.setRoomInfo(data);
  if (data.roomUsers) {
    console.log('Room info: ', data);
    deps.stateSetters.setPlayers(data.roomUsers);
  }
  return CONTINUE;
}

/**
 * Handle join room event
 */
export function handleJoinRoom(data: RoomEventData, deps: HandlerDeps): HandlerResult {
  if (
    data.error?.errorCode === 403 &&
    data.error?.message?.startsWith('No valid server instance for the room')
  ) {
    deps.notifications.openNotification({
      description: deps.render.renderGameEndedNotification(),
      dark: false,
      icon: deps.render.renderWarningIcon(),
      iconColor: '#FF6F41',
      footer: deps.render.renderNewGameButton(),
    });
    deps.router.push('/dashboard');
  }
  deps.wsProvider.send(JSON.stringify({ event: 'room-info', data: {} }));
  return CONTINUE;
}

/**
 * Handle quit room event
 */
export function handleQuitRoom(data: QuitRoomEventData, deps: HandlerDeps): HandlerResult {
  if (data.reason === 'KICKED_BY_ROOM_OWNER') {
    deps.notifications.openNotification({
      title: 'You were kicked!',
      dark: true,
      iconColor: 'blue',
      footer: deps.render.renderQuitButton(),
    });
  } else if (data.reason === 'PLAYER_LEFT') {
    deps.notifications.openNotification({
      title: 'Opponent left',
      description: 'Your opponent has left the game.',
      dark: false,
      icon: deps.render.renderWarningIcon(),
      iconColor: '#FF6F41',
      footer: deps.render.renderQuitButton(),
    });
  }
  return CONTINUE;
}

/**
 * Handle game results event
 */
export function handleGameResults(data: GameResultsEventData, deps: HandlerDeps): HandlerResult {
  console.log('game-results', data);
  deps.stateSetters.setResults(data);
  setGlobalResults(true);
  return CONTINUE;
}

/**
 * Handle game info event
 */
export function handleGameInfo(data: GameEventData, deps: HandlerDeps): HandlerResult {
  if (data.state === 'ended' && hasResults()) {
    return CONTINUE;
  }

  const currentState = deps.getGameState();
  deps.stateSetters.setGameState({ ...(currentState as object), ...data });

  if (data.state === 'ended' && !hasResults()) {
    deps.wsProvider.send(JSON.stringify({ event: 'game-results', data: {} }));
    deps.notifications.openNotification({
      title: 'Game Over!',
      dark: true,
      iconColor: 'blue',
      footer: deps.render.renderQuitButton(),
    });
  }

  console.log('game-info": ', data);
  return CONTINUE;
}

/**
 * Handle game updated event
 */
export function handleGameUpdated(data: GameEventData, deps: HandlerDeps): HandlerResult {
  deps.stateSetters.setGameState({ ...data });

  setTimeout(() => {
    if (data.state === 'started') {
      deps.notifications.closeNotification();
      if (!isGameStarted() && !hasResults()) {
        deps.uiActions.playStartGameSound();
        setGameStarted(true);
      }
      if (!window.location.pathname.split('?')[0].endsWith('/dashboard')) {
        deps.router.push('/play');
      }
    }
  }, 0);

  console.log('game-updated": ', data);
  return CONTINUE;
}

/**
 * Handle next game event
 */
export function handleNextGame(data: unknown, deps: HandlerDeps): HandlerResult {
  console.log('next-game', data);
  return CONTINUE;
}

/**
 * Handle choose NFT cards event
 */
export function handleChooseNftCards(data: unknown, deps: HandlerDeps): HandlerResult {
  console.log('choose-nft-cards sub: ', data);
  return CONTINUE;
}

/**
 * Handle WebSocket close event
 */
export function handleWSClose(data: WSCloseEventData, deps: HandlerDeps): HandlerResult {
  console.log('on close: ' + data.code);

  // Don't reconnect if there's already a connection opened in the backend
  if (data.code === 4000) {
    if (!localStorage.getItem('adding-metamask')) {
      deps.stateSetters.setIsAlreadyConnected(true);
    }
    deps.wsProvider.close();
  }

  // Don't reconnect if there's a new connection opened in the backend
  if (data.code === 4001) {
    deps.notifications.openNotification({
      title: 'Already connected!',
      description: 'You are already in a lobby or a game in an another browser or tab.',
      dark: false,
      footer: deps.render.renderReloadButton(),
      icon: deps.render.renderWarningIcon(),
      iconColor: '#FF6F41',
    });
    setConnectionClosed(true);
    deps.wsProvider.close();
  }
  return CONTINUE;
}

// ============================================================================
// ERROR HANDLERS
// ============================================================================

/**
 * Check for "Player must be in a room" error
 */
function checkPlayerNotInRoomError(data: GameEventData, deps: HandlerDeps): boolean {
  if (data.error?.message === 'Player must be in a room') {
    deps.router.push('/dashboard');
    return true;
  }
  return false;
}

/**
 * Check for "Joining while hosting" error
 */
function checkJoiningWhileHostingError(data: GameEventData, deps: HandlerDeps): boolean {
  if (data.error?.message === 'Joining while hosting a game is forbidden') {
    deps.notifications.openNotification({
      title: 'Sorry',
      description: 'Cannot join rooms while hosting a game. Quit the game and try again!',
      dark: false,
      icon: deps.render.renderWarningIcon(),
      iconColor: '#FF6F41',
      footer: deps.render.renderQuitButton(),
    });
    return true;
  }
  return false;
}

/**
 * Check for "No valid server instance" error
 */
function checkNoValidServerError(data: GameEventData): boolean {
  return data.error?.message === 'No valid server instance for the room';
}

// ============================================================================
// MAIN HANDLER FACTORY
// ============================================================================

/**
 * Create the main WebSocket message handler
 */
export function createWSMessageHandler(legacyDeps: HandlerDependencies): (event: MessageEvent) => void {
  // Convert legacy deps to new format
  const deps: HandlerDeps = {
    notifications: legacyDeps.notifications,
    stateSetters: legacyDeps.stateSetters,
    router: legacyDeps.router,
    wsProvider: legacyDeps.wsProvider,
    uiActions: legacyDeps.uiActions,
    getGameState: legacyDeps.getGameState,
    render: {
      renderWarningIcon: legacyDeps.renderWarningIcon,
      renderQuitButton: legacyDeps.renderQuitButton,
      renderNewGameButton: legacyDeps.renderNewGameButton,
      renderReloadButton: legacyDeps.renderReloadButton,
      renderDashboardButton: legacyDeps.renderDashboardButton,
      renderGameEndedNotification: legacyDeps.renderGameEndedNotification,
    },
  };

  return function handleMessage({ data }: MessageEvent) {
    deps.stateSetters.setIsAlreadyConnected(false);

    const event: WSEvent = JSON.parse(data);

    // Skip pong
    if (event.event === 'pong') {
      return;
    }

    // Log non-timer events
    if (event.event !== 'timer') {
      console.log('Game Provider WS event:', event);
    }

    const eventData = event.data;

    // Check for global errors first
    if (checkPlayerNotInRoomError(eventData as GameEventData, deps)) {
      return;
    }
    if (checkNoValidServerError(eventData as GameEventData)) {
      return;
    }
    if (checkJoiningWhileHostingError(eventData as GameEventData, deps)) {
      return;
    }

    // Route to appropriate handler
    let result: HandlerResult = CONTINUE;

    switch (event.event) {
      case 'timer':
        result = handleTimer(eventData as unknown as TimerEventData, deps);
        break;
      case 'user-socket-idle':
        result = handleUserSocketIdle(eventData as unknown as UserSocketIdleEventData, deps);
        break;
      case 'user-info':
        result = handleUserInfo(eventData as unknown as UserInfoEventData, deps);
        break;
      case 'create-room':
        result = handleCreateRoom(eventData as unknown as CreateRoomEventData, deps);
        break;
      case 'close-room':
        result = handleCloseRoom(eventData as unknown as CloseRoomEventData, deps);
        break;
      case 'room-updated':
        result = handleRoomUpdated(eventData as unknown as RoomEventData, deps);
        break;
      case 'room-info':
        result = handleRoomInfo(eventData as unknown as RoomEventData, deps);
        break;
      case 'join-room':
        result = handleJoinRoom(eventData as unknown as RoomEventData, deps);
        break;
      case 'quit-room':
        result = handleQuitRoom(eventData as unknown as QuitRoomEventData, deps);
        break;
      case 'game-results':
        result = handleGameResults(eventData as unknown as GameResultsEventData, deps);
        break;
      case 'game-info':
        result = handleGameInfo(eventData as unknown as GameEventData, deps);
        break;
      case 'game-updated':
        result = handleGameUpdated(eventData as unknown as GameEventData, deps);
        break;
      case 'next-game':
        result = handleNextGame(eventData, deps);
        break;
      case 'choose-nft-cards':
        result = handleChooseNftCards(eventData, deps);
        break;
      default:
        console.log('Unhandled WS event:', event.event);
    }

    // Result is used for future extension (e.g., middleware chain)
    void result;
  };
}

/**
 * Create the WebSocket close handler
 */
export function createWSCloseHandler(legacyDeps: HandlerDependencies): (event: RWSCloseEvent) => void {
  const deps: HandlerDeps = {
    notifications: legacyDeps.notifications,
    stateSetters: legacyDeps.stateSetters,
    router: legacyDeps.router,
    wsProvider: legacyDeps.wsProvider,
    uiActions: legacyDeps.uiActions,
    getGameState: legacyDeps.getGameState,
    render: {
      renderWarningIcon: legacyDeps.renderWarningIcon,
      renderQuitButton: legacyDeps.renderQuitButton,
      renderNewGameButton: legacyDeps.renderNewGameButton,
      renderReloadButton: legacyDeps.renderReloadButton,
      renderDashboardButton: legacyDeps.renderDashboardButton,
      renderGameEndedNotification: legacyDeps.renderGameEndedNotification,
    },
  };

  return function handleClose(e: RWSCloseEvent) {
    handleWSClose({ code: e.code }, deps);
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
