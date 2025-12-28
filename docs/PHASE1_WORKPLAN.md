# Phase 1: Atomic State Migration - Detailed Workplan

**Goal:** Replace ALL game state with reducer in ONE atomic change
**Principle:** NO DUAL STATE - delete old, not "keep temporarily"

---

## Overview

This is a single atomic commit that:
1. Adds reducer to GameProvider
2. DELETES all useState that the reducer replaces
3. Updates ALL consumers in the same commit
4. Deletes global state module

If any part breaks, we revert the whole commit. No partial state.

---

## Pre-Flight Checklist

Before starting:
- [ ] On branch `rebuild/gameboard-v2`
- [ ] `yarn lint:tsc` passes
- [ ] `yarn test` passes
- [ ] Understand what `state.serverState` and `state.board` contain

---

## Step 1: Modify GameProvider

**File:** `components/GameProvider/index.tsx`

### 1.1 Add imports

```typescript
import { useReducer } from 'react';
import { gameReducer, initialGameState, GameReducerState } from '../../store/gameReducer';
import {
  gameStateReceived,
  setCurrentPlayer,
  GameAction
} from '../../store/gameActions';
```

### 1.2 Add reducer hook

After the WSProvider line (~line 85):
```typescript
// SINGLE SOURCE OF TRUTH for game state
const [state, dispatch] = useReducer(gameReducer, initialGameState);
```

### 1.3 DELETE these useState declarations

Remove completely:
```typescript
// DELETE: const [gameState, setGameState] = useState<any>(null);
// DELETE: const [isMyTurn, setIsMyTurn] = useState<any>(null);
// DELETE: const [playersGame, setPlayersGame] = useState<any>([]);
```

### 1.4 DELETE these useEffects

Remove the useEffect that syncs isMyTurn/playersGame (~line 267-274):
```typescript
// DELETE THIS ENTIRE BLOCK:
// useEffect(() => {
//   if (!gameState) { return; }
//   setIsMyTurn(user.userId === gameState.turnForPlayer);
//   setPlayersGame(gameState.allGamePlayers);
// }, [gameState]);
```

### 1.5 Add useEffect to set current player

```typescript
// Set current player in reducer when user is authenticated
useEffect(() => {
  if (user?.userId) {
    dispatch(setCurrentPlayer(user.userId));
  }
}, [user?.userId]);
```

### 1.6 Update context type

```typescript
export type IGameProviderContext = {
  // NEW: Reducer state and dispatch
  state: GameReducerState;
  dispatch: React.Dispatch<GameAction>;

  // KEEP: Room/lobby state (separate concern)
  players: any;
  roomId: any;
  roomInfo: any;
  setRoomId: any;
  setPlayers: any;

  // KEEP: UI state
  selectedCard: any;
  setSelectedCard: any;
  timer: any;
  totalSeconds: any;

  // KEEP: Results flow
  results: any;

  // KEEP: Connection state
  userInfo: any;
  isBackendReady: boolean;
  isAlreadyConnected: boolean;
  userSocketIdle: any;
  setUserSocketIdle: any;
};
```

### 1.7 Update memoedValue

```typescript
const memoedValue = useMemo(
  () => ({
    state,
    dispatch,
    players,
    roomId,
    roomInfo,
    selectedCard,
    setSelectedCard,
    setRoomId,
    setPlayers,
    timer,
    totalSeconds,
    results,
    userInfo,
    isBackendReady,
    isAlreadyConnected,
    userSocketIdle,
    setUserSocketIdle,
  }),
  [
    state,
    players,
    roomId,
    roomInfo,
    selectedCard,
    timer,
    totalSeconds,
    results,
    userInfo,
    isBackendReady,
    isAlreadyConnected,
    userSocketIdle,
  ]
);
```

### 1.8 Update handler dependencies

In the WS setup useEffect, update handlerDeps:

```typescript
const handlerDeps: HandlerDependencies = {
  notifications: { openNotification, closeNotification },
  stateSetters: {
    setTimer,
    setTotalSeconds,
    setUserSocketIdle,
    setUserInfo,
    setIsBackendReady,
    setRoomId,
    setResults,
    setRoomInfo,
    setPlayers,
    setPlayingAgain,
    setIsAlreadyConnected,
    // REMOVE: setGameState - no longer exists
  },
  dispatch,  // ADD: dispatch for reducer actions
  router,
  wsProvider: WSProvider,
  // ... rest stays same
};
```

---

## Step 2: Modify wsEventHandlers.ts

**File:** `utils/wsEventHandlers.ts`

### 2.1 Update HandlerDependencies type

```typescript
import { GameAction, gameStateReceived } from '../store/gameActions';

export interface HandlerDependencies {
  notifications: NotificationActions;
  stateSetters: StateSetters;
  dispatch: React.Dispatch<GameAction>;  // ADD
  router: NextRouter;
  // ... rest
}
```

### 2.2 Update StateSetters - remove setGameState

```typescript
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
  // REMOVE: setGameState - replaced by dispatch
}
```

### 2.3 Update handleGameUpdated

```typescript
export function handleGameUpdated(
  data: GameEventData,
  dispatch: React.Dispatch<GameAction>,  // CHANGE parameter
  notifications: NotificationActions,
  router: NextRouter,
  uiActions: Pick<UIActions, 'playStartGameSound'>
): void {
  // Dispatch to reducer instead of setState
  dispatch(gameStateReceived(data as GameStatePayload));

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
}
```

### 2.4 Update handleGameInfo

```typescript
export function handleGameInfo(
  data: GameEventData,
  dispatch: React.Dispatch<GameAction>,  // CHANGE parameter
  wsProvider: WSProviderType,
  notifications: NotificationActions,
  renderQuitButton: () => ReactNode
): void {
  if (data.state === 'ended' && hasResults()) {
    return;
  }

  // Dispatch to reducer
  if (data.gameId) {
    dispatch(gameStateReceived(data as GameStatePayload));
  }

  if (data.state === 'ended' && !hasResults()) {
    wsProvider.send(JSON.stringify({ event: 'game-results', data: {} }));
    notifications.openNotification({
      title: 'Game Over!',
      dark: true,
      iconColor: 'blue',
      footer: renderQuitButton(),
    });
  }
}
```

### 2.5 Update createWSMessageHandler

Update the calls to handleGameUpdated and handleGameInfo:

```typescript
// Game updated
if (event.event === 'game-updated') {
  handleGameUpdated(
    eventData,
    deps.dispatch,  // Pass dispatch instead of setters
    deps.notifications,
    deps.router,
    deps.uiActions
  );
}

// Game info
if (event.event === 'game-info') {
  handleGameInfo(
    eventData,
    deps.dispatch,  // Pass dispatch instead of setters/getGameState
    deps.wsProvider,
    deps.notifications,
    deps.renderQuitButton
  );
}
```

---

## Step 3: Update GameBoard

**File:** `components/GameBoard/index.tsx`

### 3.1 Update imports and useGame destructuring

```typescript
const { state, dispatch, players, selectedCard } = useGame();

// Derive what we need from reducer state
const board = state.board;
const isMyTurn = state.isMyTurn;
const gameState = state.serverState;  // For allowedUserCardsPlacement access
const pendingAnimation = state.pendingAnimation;
```

### 3.2 DELETE local state

Remove:
```typescript
// DELETE: const [reducerState, dispatch] = useReducer(gameReducer, initialGameState);
// DELETE: const [board, setBoard] = useState(() => generateBoard(7, 5));
// DELETE: const [lastPlayedCard, setLastPlayedCard] = useState<NormalizedCard | null>(null);
// DELETE: const animatingCardIdRef = useRef<string | null>(null);
// DELETE: const lastProcessedServerCardRef = useRef<string | null>(null);
```

### 3.3 DELETE legacy functions

Remove:
```typescript
// DELETE: function generateBoard(x, y) { ... }
// DELETE: const startAnimation = useCallback(...)
// DELETE: const addCardToBoard = useCallback(...)
```

### 3.4 DELETE sync useEffects

Remove:
```typescript
// DELETE: useEffect for setGlobalSelectedCard
// DELETE: useEffect for setGlobalState
// DELETE: useEffect that dispatches gameStateReceived (now done in GameProvider)
// DELETE: useEffect that syncs board from gameState (lines 295-361)
```

### 3.5 Update addCard function

```typescript
const addCard = useCallback(
  (rowIndex: number, columnIndex: number, card = selectedCard) => () => {
    if (!card || !gameState) {
      return;
    }

    const allowedPlacement = gameState.allowedUserCardsPlacement?.additionalProperties?.[
      `${columnIndex}-${rowIndex}`
    ];

    if (!allowedPlacement) {
      // Show error feedback
      setCardError([rowIndex, columnIndex]);
      setTimeout(() => setCardError([]), 1000);
      return;
    }

    // Validate card is allowed
    const isAllowed = allowedPlacement.some(
      (allowed: { suit: string; value: string }) =>
        (allowed.value === 'joker' && card.value === 'joker') ||
        (allowed.suit.toLowerCase() === card.suit.toLowerCase() &&
         allowed.value === card.value)
    );

    if (!isAllowed) {
      setCardError([rowIndex, columnIndex]);
      setTimeout(() => setCardError([]), 1000);
      return;
    }

    // Create normalized card
    const normalizedCard: NormalizedCard = {
      id: card.id || `${card.suit}-${card.value}-${gameState.turnForPlayer}`,
      suit: card.suit.toLowerCase(),
      value: String(card.value).toLowerCase(),
      userId: gameState.turnForPlayer,
      powerLevel: card.powerLevel,
      scoringLevel: 0,
      imageUrl: card.imageUrl || card.img,
      videoUrl: card.videoUrl || card.video,
      isNft: !!card.id && card.id !== '',
    };

    const position = { x: columnIndex, y: rowIndex };
    const moveKey = generateMoveKey(normalizedCard, position);

    // Dispatch to reducer (optimistic update)
    dispatch(localMoveInitiated({
      moveKey,
      card: normalizedCard,
      position,
      playerId: gameState.turnForPlayer,
      timestamp: Date.now(),
      isLocal: true,
      confirmed: false,
    }));

    // Send to server
    WSProvider.send(JSON.stringify({
      event: 'play-card',
      data: {
        action: 'move',
        x: columnIndex,
        y: rowIndex,
        suit: card.suit,
        value: card.value.toString(),
        nftId: card.id || '',
      },
    }));
  },
  [WSProvider, selectedCard, gameState, dispatch]
);
```

### 3.6 Update useAnimationQueue hook usage

```typescript
const { currentAnimation } = useAnimationQueue({
  pendingAnimation: state.pendingAnimation,
  dispatch,
});
```

### 3.7 Update board rendering

The board rendering loop should use `state.board` (already assigned to `board` variable).

Keep `cardError` as local useState (it's UI feedback, not game state).

---

## Step 4: Update GameInventory

**File:** `components/GameInventory/index.tsx`

### 4.1 Update useGame destructuring

```typescript
const { state, selectedCard, setSelectedCard, players } = useGame();
const { user } = useAuth();

// Derive turn info from reducer state
const isMyTurn = state.serverState.turnForPlayer === user.userId;
```

### 4.2 Replace gameState references

Find/replace:
- `gameState?.turnForPlayer` → `state.serverState?.turnForPlayer`
- `gameState?.turnForPlayer === user.userId` → `isMyTurn`

---

## Step 5: Update pages/play

**File:** `pages/play/index.tsx`

### 5.1 Update useGame destructuring

```typescript
const { state, isBackendReady, isAlreadyConnected } = useGame();
```

### 5.2 Replace gameState references

```typescript
// Change:
// const cards = gameState.gameUsersWithCards.filter(...)
// To:
const gameUsersWithCards = state.serverState?.gameUsersWithCards || [];
const cards = gameUsersWithCards.filter(
  (userCards: any) => userCards.userId === user.userId
)[0]?.cards || [];
```

### 5.3 Update conditionals

```typescript
// Change: if (!gameState) return;
// To: if (!state.serverState?.gameId) return;
```

---

## Step 6: Delete utils/gameState.ts

**File:** `utils/gameState.ts`

Delete the entire file.

Then find and remove all imports of it:
```bash
grep -r "from.*gameState" --include="*.tsx" --include="*.ts"
```

Remove these imports and any usage of:
- `setGlobalSelectedCard`, `getGlobalSelectedCard`
- `setGlobalState`, `getGlobalState`
- `setGameStarted`, `isGameStarted` (keep only if used outside game board)
- etc.

**Note:** Some functions like `isGameStarted()`, `hasResults()` are used in wsEventHandlers. We may need to keep a minimal version or pass these as params.

---

## Step 7: Fix Remaining Imports/References

Run TypeScript check:
```bash
yarn lint:tsc
```

Fix any remaining type errors from:
- Missing imports
- Changed function signatures
- Removed properties from context

---

## Validation Checklist

After ALL changes are complete:

- [ ] `yarn lint:tsc` passes (no type errors)
- [ ] `yarn test` passes (existing tests work)
- [ ] `yarn dev` starts without errors
- [ ] Open browser, login works
- [ ] Create room works
- [ ] Second player can join
- [ ] Start game works
- [ ] Board renders with initial card
- [ ] Can place a card (dispatches to reducer)
- [ ] Opponent sees the card
- [ ] Animation plays
- [ ] Turn changes
- [ ] Game ends, results show

---

## Commit

Only after ALL validation passes:

```bash
git add -A
git commit -m "feat: Atomic migration to reducer-based game state

BREAKING: Complete replacement of game state management

- Add useReducer(gameReducer) to GameProvider
- DELETE gameState/isMyTurn/playersGame useState
- DELETE utils/gameState.ts global state module
- Update wsEventHandlers to dispatch actions
- Update GameBoard to read state.board
- Update GameInventory to read state.serverState
- Update pages/play to read state.serverState

NO DUAL STATE - single source of truth via reducer.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## If Something Breaks

```bash
# Discard all changes, go back to clean state
git checkout -- .

# Or if already committed
git reset --hard HEAD~1
```

The branch provides isolation. Main is untouched.
