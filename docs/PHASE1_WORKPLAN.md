# Phase 1: GameProvider Refactor - Detailed Workplan

**Goal:** Move game state management to reducer, make it the single source of truth

---

## Current State Analysis

### GameProvider useState Inventory (16 total)

| State Variable | Used For | Decision |
|---------------|----------|----------|
| `gameState` | Board, cards, turn, placements | **MOVE TO REDUCER** |
| `isMyTurn` | Turn indicator | **DERIVE FROM REDUCER** |
| `playersGame` | Players with points | **MOVE TO REDUCER** (it's `allGamePlayers`) |
| `selectedCard` | Currently selected card in hand | **KEEP** (UI state, not game state) |
| `players` | Room players (lobby) | **KEEP** (room state, not game state) |
| `playersInfo` | Fetched player details | **KEEP** (cache, not game state) |
| `roomInfo` | Room metadata | **KEEP** (room state) |
| `roomId` | Current room ID | **KEEP** (room state) |
| `results` | Game results | **KEEP** (results flow) |
| `timer` | Countdown timer | **KEEP** (UI state) |
| `totalSeconds` | Timer total | **KEEP** (UI state) |
| `isBackendReady` | WS connected | **KEEP** (connection state) |
| `isAlreadyConnected` | Duplicate tab detection | **KEEP** (connection state) |
| `userInfo` | Current user WS info | **KEEP** (user state) |
| `userSocketIdle` | Idle detection | **KEEP** (connection state) |
| `playingAgain` | Play again flow | **KEEP** (UI state) |

### What Consumers Need

| Consumer | Currently Uses | After Refactor |
|----------|---------------|----------------|
| `GameBoard` | `gameState`, `isMyTurn`, `players`, `selectedCard` | `state` (from reducer), `players`, `selectedCard` |
| `GameInventory` | `gameState.turnForPlayer`, `selectedCard`, `players` | `state.serverState.turnForPlayer`, `selectedCard`, `players` |
| `pages/play` | `gameState.gameUsersWithCards`, `isBackendReady` | `state.serverState`, `isBackendReady` |

---

## Step-by-Step Implementation

### Step 1.1: Add reducer to GameProvider
**File:** `components/GameProvider/index.tsx`

```typescript
// Add import
import { useReducer } from 'react';
import { gameReducer, initialGameState, GameReducerState } from '../../store/gameReducer';
import { gameStateReceived, setCurrentPlayer } from '../../store/gameActions';

// Add reducer hook (after other useState declarations)
const [state, dispatch] = useReducer(gameReducer, initialGameState);
```

**Validation:** App compiles, no runtime errors

---

### Step 1.2: Dispatch SET_CURRENT_PLAYER when user is known
**File:** `components/GameProvider/index.tsx`

Add useEffect to set current player when auth user is available:

```typescript
// After user is known from auth, set it in reducer
useEffect(() => {
  if (user?.userId) {
    dispatch(setCurrentPlayer(user.userId));
  }
}, [user?.userId]);
```

**Validation:** Console log in reducer shows SET_CURRENT_PLAYER action

---

### Step 1.3: Dispatch GAME_STATE_RECEIVED on game-updated event
**File:** `utils/wsEventHandlers.ts`

Modify `handleGameUpdated` to also dispatch to reducer:

```typescript
// Current code sets gameState via useState
setters.setGameState({ ...data });

// ADD: Also dispatch to reducer
if (deps.dispatch) {
  deps.dispatch(gameStateReceived(data));
}
```

**Also update HandlerDependencies type:**
```typescript
export interface HandlerDependencies {
  // ... existing fields
  dispatch?: (action: GameAction) => void;  // Add this
}
```

**Validation:** Console shows GAME_STATE_RECEIVED in reducer when game updates

---

### Step 1.4: Update context type and value
**File:** `components/GameProvider/index.tsx`

Update `IGameProviderContext`:

```typescript
export type IGameProviderContext = {
  // NEW - reducer state and dispatch
  state: GameReducerState;
  dispatch: React.Dispatch<GameAction>;

  // KEEP - these stay as useState
  players: any;
  playersGame: any;  // Will derive from state.serverState.allGamePlayers later
  roomId: any;
  userInfo: any;
  roomInfo: any;
  selectedCard: any;
  setSelectedCard: any;
  setRoomId: any;
  setPlayers: any;
  timer: any;
  totalSeconds: any;
  results: any;
  userSocketIdle: any;
  setUserSocketIdle: any;
  isBackendReady: boolean;
  isAlreadyConnected: boolean;

  // DEPRECATED - will remove in Phase 2
  gameState: any;  // Keep temporarily for backwards compat
  isMyTurn: any;   // Keep temporarily for backwards compat
};
```

Update `memoedValue`:
```typescript
const memoedValue = useMemo(
  () => ({
    // NEW
    state,
    dispatch,

    // Existing...
    gameState,  // Temporary - remove in Phase 2
    isMyTurn,   // Temporary - remove in Phase 2
    players,
    playersGame,
    // ... rest
  }),
  [state, dispatch, gameState, isMyTurn, players, /* ... */]
);
```

**Validation:** TypeScript compiles, context provides state and dispatch

---

### Step 1.5: Pass dispatch to WS handler dependencies
**File:** `components/GameProvider/index.tsx`

In the useEffect that sets up WS handlers:

```typescript
const handlerDeps: HandlerDependencies = {
  // ... existing fields
  dispatch,  // ADD THIS
};
```

**Validation:** reducer receives GAME_STATE_RECEIVED when game-updated fires

---

### Step 1.6: Derive isMyTurn from reducer state
**File:** `components/GameProvider/index.tsx`

Replace the derived `isMyTurn` logic:

```typescript
// REMOVE this useEffect:
// useEffect(() => {
//   if (!gameState) return;
//   setIsMyTurn(user.userId === gameState.turnForPlayer);
//   setPlayersGame(gameState.allGamePlayers);
// }, [gameState]);

// The reducer already computes isMyTurn in state.isMyTurn
// Consumers will use state.isMyTurn instead
```

For backwards compatibility during transition, keep `isMyTurn` in context but derive it:

```typescript
// In memoedValue, derive from reducer:
isMyTurn: state.isMyTurn,
playersGame: state.serverState.allGamePlayers,
```

**Validation:** Turn changes work, card tray highlights correctly

---

### Step 1.7: Verify game-info event also dispatches
**File:** `utils/wsEventHandlers.ts`

Check `handleGameInfo` - it also updates game state:

```typescript
export function handleGameInfo(
  data: GameEventData,
  setters: Pick<StateSetters, 'setGameState'>,
  getGameState: () => unknown,
  wsProvider: WSProviderType,
  notifications: NotificationActions,
  renderQuitButton: () => ReactNode,
  dispatch?: (action: GameAction) => void  // ADD
): void {
  // ... existing code

  const currentState = getGameState();
  const mergedState = { ...currentState as object, ...data };
  setters.setGameState(mergedState);

  // ADD: Dispatch to reducer if we have full game state
  if (dispatch && mergedState.gameId) {
    dispatch(gameStateReceived(mergedState as GameStatePayload));
  }
}
```

**Validation:** Initial game load populates reducer state

---

## Validation Checklist

After completing all steps:

- [ ] App loads without errors
- [ ] Console shows `SET_CURRENT_PLAYER` when user authenticates
- [ ] Console shows `GAME_STATE_RECEIVED` when joining/starting game
- [ ] `state.serverState` contains game data (check React DevTools)
- [ ] `state.board` is populated with cells
- [ ] `state.isMyTurn` updates when turn changes
- [ ] Existing game flow still works (backwards compat via legacy `gameState`)

---

## Files Changed

| File | Changes |
|------|---------|
| `components/GameProvider/index.tsx` | Add reducer, update context type, pass dispatch |
| `utils/wsEventHandlers.ts` | Add dispatch param, call reducer actions |
| `store/gameActions.ts` | Possibly export action types for handler |

---

## Rollback Plan

If something breaks:
1. Remove `dispatch` from handler dependencies
2. Remove `state` and `dispatch` from context
3. Remove reducer import and useReducer call
4. Commit is isolated, easy to revert

---

## Next Phase Preview

After Phase 1 is validated, Phase 2 will:
1. Update GameBoard to read from `state.board` instead of local useState
2. Update GameBoard to use `state.isMyTurn` instead of context `isMyTurn`
3. Remove legacy `gameState` and `isMyTurn` from context
4. Remove the duplicate useEffect that syncs to local board state
