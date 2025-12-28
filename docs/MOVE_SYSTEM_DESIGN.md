# Move System Design Document

## Phase 1: End-to-End Flow Mapping & Move Event Contract

---

## 1. CURRENT END-TO-END FLOW

### 1.1 Backend: Move Validation & Processing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Client sends 'play-card' WS event                                          │
│         │                                                                    │
│         ▼                                                                    │
│  events.gateway.ts:981-1024 - @SubscribeMessage('play-card')                │
│         │  Guards: HasUserContext, HasRoomContext, RoomInServer             │
│         │  Validation: PayloadValidationPipe<PlayCardPub>                   │
│         │                                                                    │
│         ▼                                                                    │
│  events.processor.ts:589-644 - BullMQ job queue                             │
│         │  Job: { handle: 'playCard', userId, roomId }                      │
│         │                                                                    │
│         ▼                                                                    │
│  events.service.ts:1053-1130 - playCard()                                   │
│         │  1. Validate game exists                                          │
│         │  2. Validate game state === 'started'                             │
│         │  3. Validate turnForPlayer === userId                             │
│         │                                                                    │
│         ▼                                                                    │
│  game.service.ts:2044-2403 - _playCard()                                    │
│         │  1. Fetch game state with cards                                   │
│         │  2. Build tableCellInfo[][] & usersCardsInfo                      │
│         │  3. Find card in player's hand                                    │
│         │  4. Validate placement via allowedCardPlacement()                 │
│         │  5. Update MongoDB:                                               │
│         │     - Add card to gameTableCards at (x,y)                         │
│         │     - Remove card from player hand                                │
│         │     - Update turnForPlayer                                        │
│         │     - Set lastPlayedCard                                          │
│         │                                                                    │
│         ▼                                                                    │
│  events.processor.ts:222-360 - MongoDB Change Stream                        │
│         │  Detects game document update                                     │
│         │                                                                    │
│         ▼                                                                    │
│  Broadcast 'game-updated' to ALL room clients                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Frontend: Message Reception & State Update

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WsProvider/index.tsx:27-28                                                 │
│  └── ReconnectingWebSocket connection                                       │
│                                                                              │
│  GameProvider/index.tsx:334-375                                             │
│  └── Sets up WSProvider.onmessage handler                                   │
│                                                                              │
│  wsEventHandlers.ts:496-648 - createWSMessageHandler()                      │
│         │                                                                    │
│         ├── 'game-updated' (lines 638-646)                                  │
│         │   └── setGameState(data)                                          │
│         │                                                                    │
│         └── 'game-info' (lines 626-635)                                     │
│             └── setGameState(data)                                          │
│                                                                              │
│  GameProvider/index.tsx:267-274                                             │
│  └── useEffect on gameState → updates isMyTurn, playersGame                 │
│                                                                              │
│  GameBoard/index.tsx:281-346                                                │
│  └── useEffect on gameState:                                                │
│      1. Iterates gameTableCards, calls addCardToBoard()                     │
│      2. Checks gameState.lastPlayedCard                                     │
│      3. If new card → calls startAnimation()                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Current Animation Trigger Points (PROBLEMATIC)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ANIMATION TRIGGERS (Current)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LOCAL PLAYER MOVE:                                                         │
│  ─────────────────                                                          │
│  1. User drops card → addCard() (GameBoard.tsx:192-279)                     │
│     └── Optimistic: addCardToBoard() + startAnimation()                     │
│     └── Sends 'play-card' WS event                                          │
│                                                                              │
│  2. Server responds with 'game-updated'                                     │
│     └── gameState updates                                                   │
│     └── useEffect at line 281 runs:                                         │
│         - Re-adds ALL cards to board (lines 315-323)  ← PROBLEM             │
│         - Checks lastPlayedCard (lines 324-346)                             │
│         - Compares with animatingCardIdRef ← Dedup attempt                  │
│                                                                              │
│  OPPONENT MOVE:                                                             │
│  ─────────────                                                              │
│  1. Server sends 'game-updated' with opponent's move                        │
│     └── gameState updates                                                   │
│     └── useEffect at line 281 runs:                                         │
│         - Adds cards to board                                               │
│         - Checks if lastPlayedCard is new                                   │
│         - Calls startAnimation() via getCard() transform                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. FILES INVOLVED

### Backend (for reference only - not modifying)

| File | Lines | Purpose |
|------|-------|---------|
| `src/api/socket/events.gateway.ts` | 981-1024 | WS handler for 'play-card' |
| `src/api/socket/events.service.ts` | 1053-1130 | Move validation |
| `src/game/game.service.ts` | 2044-2403 | Core game logic |
| `src/api/socket/events.processor.ts` | 222-360 | Change stream broadcast |
| `src/api/common/gen/GameUpdatedSub.ts` | 1-24 | Response schema |
| `src/api/common/gen/LastPlayedCardInfo.ts` | 1-22 | Card info schema |

### Frontend (scope of refactor)

| File | Lines | Purpose | Action |
|------|-------|---------|--------|
| `components/GameBoard/index.tsx` | 1-695 | Board + animations | **REPLACE** |
| `components/GameProvider/index.tsx` | 1-594 | Game state context | **MODIFY** |
| `utils/wsEventHandlers.ts` | 1-675 | WS event routing | **MODIFY** |
| `utils/gameState.ts` | 1-103 | Global state singleton | **REMOVE/REPLACE** |
| `types/game.ts` | 1-117 | Type definitions | **EXTEND** |
| `css/style.css` | 82-139 | Animation keyframes | **KEEP** |

---

## 3. MOVE EVENT CONTRACT

### 3.1 Server → Client: `game-updated` Event

```typescript
// Event name: 'game-updated'
interface GameUpdatedEvent {
  event: 'game-updated';
  data: GameUpdatedSub;
}

interface GameUpdatedSub {
  gameId: string;                                    // Unique game ID
  tableSizeX: number;                                // Board width (7)
  tableSizeY: number;                                // Board height (5)
  state: 'opened' | 'inGame' | 'started' | 'results' | 'ended';
  turnForPlayer: string;                             // userId of next player
  gameUsersWithCards?: GameUserWithCardsInfo[];      // Player hands
  allGamePlayers: AllGamePlayers[];                  // Player metadata
  gameTableCards?: GameTableCardsInfo;               // Board state
  allowedUserCardsPlacement?: AllowedUserCardsPlacement;
  playersCurrentPoints?: PlayersCurrentPoints;
  lastPlayedCard?: LastPlayedCardInfo;               // ⭐ Animation trigger
}

interface LastPlayedCardInfo {
  id: string;                    // NFT ID or empty string
  name: string;
  xp: number;
  power: number;
  scoring: number;
  suit: CardSuit;                // e.g., "hearts" (lowercase from server)
  value: CardValue;              // e.g., "10", "ace", "king"
  onSale: boolean;
  imageUrl: string;
  videoUrl: string;
  powerLevel: number;
  scoringLevel: number;          // ⭐ Points scored (shown in animation)
  userId: string;                // ⭐ Who played (for color)
  score: number;
}

// Note: CardSuit is lowercase from server: "hearts" | "diamonds" | "clubs" | "spades"
// Frontend local cards may have capitalized: "Hearts" | "Diamonds" etc.
```

### 3.2 Client → Server: `play-card` Event

```typescript
interface PlayCardEvent {
  event: 'play-card';
  data: PlayCardPub;
}

interface PlayCardPub {
  x: number;                     // Column (0-indexed)
  y: number;                     // Row (0-indexed)
  suit: CardSuit;                // Card suit
  value: CardValue;              // Card value
  nftId?: string;                // NFT ID if NFT card
  action: 'move' | 'pass';       // Move type
}
```

### 3.3 Server → Client: `play-card` Response (Direct)

```typescript
interface PlayCardSub {
  ok: boolean;
  gameOver: boolean;
  error?: CommonError;
  subSpecificError?: 'NOT_MY_TURN' | 'INVALID_STATE' | 'INVALID_MOVE';
}
```

---

## 4. CRITICAL ISSUES IN CURRENT IMPLEMENTATION

### Issue 1: No Unique Move/Action ID

**Problem**: The backend does NOT send a unique `moveId` or `actionId` with each move. The only way to identify a move is by the card itself (`suit-value-userId`).

**Impact**:
- Cannot do proper idempotent deduplication
- Race conditions between optimistic UI and server confirmation
- No way to track "which move is this" for ordering

**Evidence**: `LastPlayedCardInfo` has no `moveId` field (see backend schema).

### Issue 2: Full State Snapshots, Not Patches

**Problem**: `game-updated` sends the FULL `gameTableCards` every time, not just the delta.

**Impact**:
- Frontend must re-process all cards on every update
- GameBoard.tsx:315-323 iterates ALL cards and calls `addCardToBoard()` every time
- Causes unnecessary state churn and potential animation restarts

**Evidence**: Lines 315-323 in GameBoard.tsx:
```javascript
Object.keys(tableCards).forEach((key) => {
  const cards = gameState.gameTableCards?.additionalProperties;
  cards[key].forEach((card: any) => {
    const cardF = getCard(card.suit, card.value, card);
    addCardToBoard(Number(indexes[1]), Number(indexes[0]), cardF);
  });
});
```

### Issue 3: Dual Path for Local vs Remote

**Problem**: Local moves use optimistic UI path, remote moves use server event path.

**Impact**:
- Two different code paths that must stay in sync
- Animation triggered differently for each
- Deduplication logic is ad-hoc (comparing refs)

**Evidence**:
- Local: addCard() → addCardToBoard() + startAnimation() (lines 251-263)
- Remote: useEffect → addCardToBoard() + startAnimation() via lastPlayedCard check (lines 324-345)

### Issue 4: Animation Key Based on Card Properties, Not Move

**Problem**: Animation renders when `lastPlayedCard.suit === boardCard.suit && lastPlayedCard.value === boardCard.value`

**Impact**:
- If same card played twice (different positions), animation logic breaks
- Case sensitivity issues (Hearts vs hearts)
- No stable key for React reconciliation

**Evidence**: Lines 482-490 in GameBoard.tsx:
```javascript
lastPlayedCard?.value === column[column.length - 1].value &&
lastPlayedCard?.suit?.toLowerCase() === column[column.length - 1].suit?.toLowerCase()
```

### Issue 5: Board State Not Derived from Server

**Problem**: `board` state is built locally by accumulating `addCardToBoard()` calls, not derived from `gameState.gameTableCards`.

**Impact**:
- State can drift from server
- No single source of truth
- Optimistic updates can desync

---

## 5. EXPECTED UI/ANIMATION BEHAVIOR

### 5.1 Local Player Move

| Step | Action | Animation |
|------|--------|-----------|
| 1 | User drops card on valid cell | Card appears immediately (optimistic) |
| 2 | Animation starts | `.game-latest-card` overlay flies in (800ms) |
| 3 | Score shown | `+{scoringLevel}` pops (800ms) |
| 4 | Server confirms | State reconciled silently (no second animation) |
| 5 | Animation ends | Overlay fades, card remains visible |

**Key**: Animation plays ONCE when card is placed, not again on server confirm.

### 5.2 Opponent Move

| Step | Action | Animation |
|------|--------|-----------|
| 1 | Server sends `game-updated` | - |
| 2 | `lastPlayedCard` detected as new | Card added to board |
| 3 | Animation starts | Same animation as local (800ms) |
| 4 | Animation ends | Card visible, turn indicator updates |

**Key**: Animation plays ONCE per `lastPlayedCard` change.

### 5.3 Animation Trigger Key

Since backend provides no `moveId`, we need to synthesize one:

```typescript
// Proposed moveKey format:
const moveKey = `${lastPlayedCard.suit}-${lastPlayedCard.value}-${lastPlayedCard.userId}-${position}`;
// Where position = "x-y" from the board position
```

This ensures:
- Same card at different positions = different keys
- Same player playing same card value = still unique
- Idempotent: same key processed = skip animation

---

## 6. DIAGRAM: Proposed Clean Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PROPOSED CLEAN ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐                                                       │
│  │   WebSocket      │                                                       │
│  │   (WsProvider)   │                                                       │
│  └────────┬─────────┘                                                       │
│           │ 'game-updated' event                                            │
│           ▼                                                                  │
│  ┌──────────────────────────────────────┐                                   │
│  │      Game State Reducer              │                                   │
│  │  ─────────────────────────────────   │                                   │
│  │  • Receives server state             │                                   │
│  │  • Derives board from gameTableCards │                                   │
│  │  • Tracks processedMoveKeys Set      │                                   │
│  │  • Emits pendingAnimation if new     │                                   │
│  └────────┬─────────────────────────────┘                                   │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────────────────────────┐                                   │
│  │      Game Context (GameProvider)     │                                   │
│  │  ─────────────────────────────────   │                                   │
│  │  • gameState: derived from server    │                                   │
│  │  • board: derived from gameTableCards│                                   │
│  │  • pendingAnimation: { moveKey, card }│                                  │
│  │  • processedAnimations: Set<string>  │                                   │
│  └────────┬─────────────────────────────┘                                   │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────────────────────────┐                                   │
│  │      GameBoard Component             │                                   │
│  │  ─────────────────────────────────   │                                   │
│  │  • Renders board from context        │                                   │
│  │  • Checks pendingAnimation           │                                   │
│  │  • If new moveKey → play animation   │                                   │
│  │  • Marks moveKey as processed        │                                   │
│  └──────────────────────────────────────┘                                   │
│                                                                              │
│  ┌──────────────────────────────────────┐                                   │
│  │      Local Move Handler              │                                   │
│  │  ─────────────────────────────────   │                                   │
│  │  • User action → optimistic update   │                                   │
│  │  • Generate moveKey, add to processed│                                   │
│  │  • Send WS event                     │                                   │
│  │  • Server confirm → no re-animation  │                                   │
│  └──────────────────────────────────────┘                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. NEXT STEPS (Phase 2)

1. **Define new type interfaces** with proper move identification
2. **Design reducer state shape** with:
   - Derived board state
   - Processed move keys set
   - Pending animation queue
3. **Define animation strategy**:
   - Single animation layer component
   - MoveKey-based trigger
   - Cleanup after animation
4. **Plan module structure** for clean separation

---

## PHASE 2: NEW ARCHITECTURE DESIGN

### 8. MODULE/FOLDER LAYOUT

```
cryptobattle-frontend/
├── types/
│   └── game.ts                    # Extended with new interfaces (MODIFY)
│
├── store/                         # NEW - Centralized game state
│   ├── gameReducer.ts            # Pure reducer for game state
│   ├── gameActions.ts            # Action creators
│   └── index.ts                  # Export store utilities
│
├── hooks/                         # NEW - Custom hooks
│   ├── useGameState.ts           # Game state access hook
│   ├── useMoveHandler.ts         # Move submission hook
│   └── useAnimationQueue.ts      # Animation queue management
│
├── components/
│   ├── GameProvider/
│   │   └── index.tsx             # MODIFY - Use new reducer
│   │
│   ├── GameBoard/
│   │   ├── index.tsx             # REPLACE - Clean board renderer
│   │   ├── BoardCell.tsx         # NEW - Single cell component
│   │   ├── CardStack.tsx         # NEW - Card stack in cell
│   │   └── AnimationOverlay.tsx  # NEW - Animation layer
│   │
│   └── ... (other components unchanged)
│
└── utils/
    ├── wsEventHandlers.ts        # MODIFY - Dispatch to reducer
    ├── gameState.ts              # REMOVE - Replace with reducer
    └── moveUtils.ts              # NEW - Move key generation
```

### 9. KEY INTERFACES & TYPES

```typescript
// types/game.ts - ADDITIONS

/**
 * Normalized card representation used everywhere in frontend
 */
export interface NormalizedCard {
  id: string;              // NFT ID or generated UUID
  suit: string;            // Always lowercase: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  value: string;           // '2'-'10' | 'jack' | 'queen' | 'king' | 'ace' | 'joker'
  userId: string;          // Who owns/played this card
  powerLevel?: number;
  scoringLevel?: number;
  imageUrl?: string;
  isNft: boolean;
}

/**
 * A move represents a card being played to the board
 */
export interface GameMove {
  moveKey: string;         // Unique key: `${suit}-${value}-${x}-${y}-${timestamp}`
  card: NormalizedCard;
  position: { x: number; y: number };
  playerId: string;
  timestamp: number;       // Client-side timestamp for ordering
  isLocal: boolean;        // true if this was an optimistic local move
  confirmed: boolean;      // true if server has confirmed
}

/**
 * Board cell containing stacked cards
 */
export interface BoardCell {
  x: number;
  y: number;
  cards: NormalizedCard[];
  isEmpty: boolean;
  isDropTarget: boolean;   // Can drop card here
}

/**
 * 2D board derived from server state
 */
export type GameBoard = BoardCell[][];

/**
 * Animation state for a pending animation
 */
export interface PendingAnimation {
  moveKey: string;
  card: NormalizedCard;
  position: { x: number; y: number };
  scoringLevel: number;
  playerId: string;
}

/**
 * Complete game reducer state
 */
export interface GameReducerState {
  // Server state (single source of truth)
  serverState: {
    gameId: string | null;
    state: 'opened' | 'inGame' | 'started' | 'results' | 'ended' | null;
    turnForPlayer: string | null;
    tableSizeX: number;
    tableSizeY: number;
    allGamePlayers: Player[];
    gameTableCards: Record<string, NormalizedCard[]>;  // "x-y" -> cards
    playerHands: Record<string, NormalizedCard[]>;     // userId -> cards
    allowedPlacements: Record<string, boolean>;        // "x-y" -> allowed
    currentPoints: Record<string, number>;             // userId -> points
    lastPlayedCard: NormalizedCard | null;
    lastPlayedPosition: { x: number; y: number } | null;
  };

  // Derived state
  board: GameBoard;
  isMyTurn: boolean;
  currentPlayerId: string | null;

  // Animation state
  pendingAnimation: PendingAnimation | null;
  processedMoveKeys: Set<string>;

  // Optimistic state
  optimisticMoves: GameMove[];

  // Meta
  isLoading: boolean;
  error: string | null;
}
```

### 10. REDUCER STATE SHAPE & ACTIONS

```typescript
// store/gameActions.ts

export type GameAction =
  | { type: 'GAME_STATE_RECEIVED'; payload: GameUpdatedSub }
  | { type: 'LOCAL_MOVE_INITIATED'; payload: GameMove }
  | { type: 'LOCAL_MOVE_CONFIRMED'; payload: { moveKey: string } }
  | { type: 'LOCAL_MOVE_REJECTED'; payload: { moveKey: string; error: string } }
  | { type: 'ANIMATION_STARTED'; payload: { moveKey: string } }
  | { type: 'ANIMATION_COMPLETED'; payload: { moveKey: string } }
  | { type: 'SET_CURRENT_PLAYER'; payload: { userId: string } }
  | { type: 'RESET_GAME' };

// store/gameReducer.ts

export function gameReducer(state: GameReducerState, action: GameAction): GameReducerState {
  switch (action.type) {
    case 'GAME_STATE_RECEIVED': {
      const serverData = action.payload;

      // Normalize server state
      const gameTableCards = normalizeTableCards(serverData.gameTableCards);
      const lastPlayedCard = serverData.lastPlayedCard
        ? normalizeCard(serverData.lastPlayedCard)
        : null;

      // Generate move key for new card (if any)
      const newMoveKey = lastPlayedCard
        ? generateMoveKey(lastPlayedCard, findCardPosition(gameTableCards, lastPlayedCard))
        : null;

      // Check if this is a new move we haven't processed
      const isNewMove = newMoveKey && !state.processedMoveKeys.has(newMoveKey);

      // Derive board from server state
      const board = deriveBoard(gameTableCards, serverData.tableSizeX, serverData.tableSizeY);

      return {
        ...state,
        serverState: {
          gameId: serverData.gameId,
          state: serverData.state,
          turnForPlayer: serverData.turnForPlayer,
          tableSizeX: serverData.tableSizeX,
          tableSizeY: serverData.tableSizeY,
          allGamePlayers: serverData.allGamePlayers,
          gameTableCards,
          playerHands: normalizePlayerHands(serverData.gameUsersWithCards),
          allowedPlacements: normalizeAllowedPlacements(serverData.allowedUserCardsPlacement),
          currentPoints: normalizePoints(serverData.playersCurrentPoints),
          lastPlayedCard,
          lastPlayedPosition: lastPlayedCard ? findCardPosition(gameTableCards, lastPlayedCard) : null,
        },
        board,
        isMyTurn: serverData.turnForPlayer === state.currentPlayerId,
        // Only set pending animation if this is a NEW move
        pendingAnimation: isNewMove ? {
          moveKey: newMoveKey!,
          card: lastPlayedCard!,
          position: findCardPosition(gameTableCards, lastPlayedCard!)!,
          scoringLevel: lastPlayedCard!.scoringLevel || 0,
          playerId: lastPlayedCard!.userId,
        } : state.pendingAnimation,
        // Remove confirmed optimistic moves
        optimisticMoves: state.optimisticMoves.filter(
          m => !isMatchingMove(m, lastPlayedCard)
        ),
      };
    }

    case 'LOCAL_MOVE_INITIATED': {
      const move = action.payload;
      return {
        ...state,
        // Add to optimistic moves
        optimisticMoves: [...state.optimisticMoves, move],
        // Pre-register the move key so we don't animate again on server confirm
        processedMoveKeys: new Set([...state.processedMoveKeys, move.moveKey]),
        // Set pending animation for local move
        pendingAnimation: {
          moveKey: move.moveKey,
          card: move.card,
          position: move.position,
          scoringLevel: 0, // Will be updated on server confirm
          playerId: move.playerId,
        },
        // Optimistically update board
        board: addCardToBoard(state.board, move.position, move.card),
      };
    }

    case 'ANIMATION_COMPLETED': {
      return {
        ...state,
        pendingAnimation: state.pendingAnimation?.moveKey === action.payload.moveKey
          ? null
          : state.pendingAnimation,
        processedMoveKeys: new Set([...state.processedMoveKeys, action.payload.moveKey]),
      };
    }

    // ... other cases
  }
}
```

### 11. ANIMATION STRATEGY

**Decision: Show actual card face during animation (Option B)**

```typescript
// hooks/useAnimationQueue.ts

/**
 * Hook to manage animation playback
 * - Single animation at a time
 * - Uses moveKey for idempotency
 * - Handles both local and remote moves uniformly
 */
export function useAnimationQueue() {
  const { pendingAnimation, dispatch } = useGameState();
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!pendingAnimation || isAnimating) return;

    // Start animation
    setIsAnimating(true);

    // Animation duration = CSS animation (800ms) + buffer (200ms)
    animationTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'ANIMATION_COMPLETED', payload: { moveKey: pendingAnimation.moveKey } });
      setIsAnimating(false);
    }, 1000);

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [pendingAnimation, isAnimating, dispatch]);

  return {
    currentAnimation: isAnimating ? pendingAnimation : null,
    isAnimating,
  };
}

// components/GameBoard/AnimationOverlay.tsx

/**
 * Dedicated animation layer - renders ABOVE the board
 * Shows the ACTUAL CARD FACE during animation (not just color box)
 */
export const AnimationOverlay: FC<{ animation: PendingAnimation | null }> = ({ animation }) => {
  if (!animation) return null;

  const { card, position, scoringLevel, playerId } = animation;
  const playerColor = usePlayerColor(playerId);

  return (
    <div
      key={animation.moveKey}  // Force remount on new animation
      className="animation-container"
      style={{
        position: 'absolute',
        top: calculateTop(position.y),
        left: calculateLeft(position.x),
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* Actual card component with animation class */}
      <div className="game-latest-card-wrapper">
        <Card
          card={card}
          animated={false}  // We handle animation via CSS class
          css={{
            outline: `6px solid ${playerColor}`,
            borderRadius: 16,
          }}
        />
        {/* Score popup overlay */}
        <div
          className="game-latest-card__score"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: '100px',
            fontFamily: 'Aldrich',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          +{scoringLevel}
        </div>
      </div>
    </div>
  );
};

// Updated CSS animation for card face visibility
// css/style.css additions:
/*
.game-latest-card-wrapper {
  animation-name: cardFlyIn;
  animation-duration: 800ms;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}

@keyframes cardFlyIn {
  0% {
    opacity: 0;
    transform: translate(-150px, -150px) rotate(-10deg) scale(1.5);
  }
  30% {
    opacity: 0.7;
    transform: translate(-75px, -75px) rotate(-5deg) scale(1.2);
  }
  70% {
    opacity: 1;
    transform: translate(0, 0) rotate(0) scale(1);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) rotate(0) scale(1);
  }
}
*/
```

### 12. MOVE KEY GENERATION

```typescript
// utils/moveUtils.ts

/**
 * Generate a unique, deterministic key for a move
 * Used for idempotency and animation deduplication
 */
export function generateMoveKey(
  card: NormalizedCard,
  position: { x: number; y: number }
): string {
  // Normalize suit to lowercase
  const suit = card.suit.toLowerCase();
  const value = card.value.toLowerCase();
  const { x, y } = position;
  const userId = card.userId;

  // Key format: suit-value-x-y-userId
  // This ensures:
  // - Same card at different positions = different keys
  // - Same card by same player at same position = same key (idempotent)
  return `${suit}-${value}-${x}-${y}-${userId}`;
}

/**
 * Find the position of a card on the board
 * Returns { x, y } or null if not found
 */
export function findCardPosition(
  tableCards: Record<string, NormalizedCard[]>,
  card: NormalizedCard
): { x: number; y: number } | null {
  for (const [key, cards] of Object.entries(tableCards)) {
    const topCard = cards[cards.length - 1];
    if (
      topCard &&
      topCard.suit.toLowerCase() === card.suit.toLowerCase() &&
      topCard.value.toLowerCase() === card.value.toLowerCase() &&
      topCard.userId === card.userId
    ) {
      const [xStr, yStr] = key.split('-');
      return { x: parseInt(xStr, 10), y: parseInt(yStr, 10) };
    }
  }
  return null;
}

/**
 * Normalize a server card to our standard format
 */
export function normalizeCard(serverCard: LastPlayedCardInfo): NormalizedCard {
  return {
    id: serverCard.id || `${serverCard.suit}-${serverCard.value}-${serverCard.userId}`,
    suit: serverCard.suit.toLowerCase(),
    value: serverCard.value.toLowerCase(),
    userId: serverCard.userId,
    powerLevel: serverCard.powerLevel,
    scoringLevel: serverCard.scoringLevel,
    imageUrl: serverCard.imageUrl,
    isNft: !!serverCard.id && serverCard.id !== '',
  };
}
```

### 13. COMPONENT FLOW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEW COMPONENT FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  GameProvider                                                               │
│  └── useReducer(gameReducer, initialState)                                  │
│  └── Provides: { state, dispatch, ... }                                     │
│                                                                              │
│  WsProvider                                                                 │
│  └── onmessage → dispatch({ type: 'GAME_STATE_RECEIVED', payload })         │
│                                                                              │
│  GameBoard                                                                  │
│  └── const { board, isMyTurn, currentAnimation } = useGameState()           │
│  └── Renders:                                                               │
│      ┌─────────────────────────────────────────────────┐                    │
│      │  <div className="game-board">                   │                    │
│      │    {board.map(row => row.map(cell =>           │                    │
│      │      <BoardCell cell={cell} />                  │                    │
│      │    ))}                                          │                    │
│      │    <AnimationOverlay animation={currentAnim} /> │                    │
│      │  </div>                                         │                    │
│      └─────────────────────────────────────────────────┘                    │
│                                                                              │
│  BoardCell                                                                  │
│  └── Handles drop events                                                    │
│  └── Calls dispatch({ type: 'LOCAL_MOVE_INITIATED', payload })              │
│  └── Sends WS 'play-card' event                                             │
│                                                                              │
│  AnimationOverlay                                                           │
│  └── Receives animation from hook                                           │
│  └── Key={moveKey} forces proper remount                                    │
│  └── CSS animation plays once                                               │
│  └── After animation → dispatch ANIMATION_COMPLETED                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 14. INSTRUMENTATION (DEBUG_ANIM=1)

```typescript
// utils/debug.ts

const DEBUG_ANIM = process.env.NEXT_PUBLIC_DEBUG_ANIM === '1';

export function logAnimation(event: string, data: Record<string, unknown>) {
  if (!DEBUG_ANIM) return;

  console.log(
    `%c[ANIM] ${event}`,
    'color: #00ff00; font-weight: bold',
    {
      timestamp: Date.now(),
      ...data,
    }
  );
}

// Usage in reducer:
case 'GAME_STATE_RECEIVED': {
  logAnimation('STATE_RECEIVED', {
    moveKey: newMoveKey,
    isNewMove,
    processedKeys: state.processedMoveKeys.size,
  });
  // ...
}

case 'LOCAL_MOVE_INITIATED': {
  logAnimation('LOCAL_MOVE', {
    moveKey: action.payload.moveKey,
    card: `${action.payload.card.suit}-${action.payload.card.value}`,
    position: action.payload.position,
  });
  // ...
}

case 'ANIMATION_COMPLETED': {
  logAnimation('ANIM_COMPLETE', {
    moveKey: action.payload.moveKey,
  });
  // ...
}
```

### 15. MIGRATION PLAN

1. **Create new files first** (no breaking changes)
   - `types/game.ts` - Add new interfaces
   - `store/gameReducer.ts` - New reducer
   - `store/gameActions.ts` - Action types
   - `utils/moveUtils.ts` - Helper functions
   - `utils/debug.ts` - Debug logging
   - `hooks/useGameState.ts` - State hook
   - `hooks/useAnimationQueue.ts` - Animation hook

2. **Create new GameBoard components**
   - `components/GameBoard/BoardCell.tsx`
   - `components/GameBoard/CardStack.tsx`
   - `components/GameBoard/AnimationOverlay.tsx`
   - `components/GameBoard/GameBoardNew.tsx` - New implementation

3. **Wire up in GameProvider**
   - Add useReducer alongside existing state
   - Dispatch to reducer from WS handlers
   - Expose new state via context

4. **Feature flag the new board**
   - `NEXT_PUBLIC_NEW_BOARD=1` to use new implementation
   - Allows parallel testing

5. **Remove old implementation**
   - Delete old GameBoard code
   - Remove `utils/gameState.ts`
   - Clean up unused wsEventHandler code

---

*Phase 2 complete. Proceed to Phase 3 for implementation.*

---

*Document generated as part of Move System redesign, Phase 1-2*
