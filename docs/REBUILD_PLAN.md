# GameBoard V2 Rebuild Plan

**Branch:** `rebuild/gameboard-v2`
**Goal:** Clean rebuild of GameBoard using ONLY the reducer pattern, eliminating dual-state bugs

---

## What We're Keeping (Working Code)

| File | Lines | Status |
|------|-------|--------|
| `store/gameReducer.ts` | 461 | KEEP - Well-tested, clean architecture |
| `store/gameActions.ts` | 185 | KEEP - Proper action types |
| `utils/moveUtils.ts` | ~150 | KEEP - Move key generation |
| `utils/wsEventHandlers.ts` | 674 | KEEP - Properly modularized |
| `hooks/useAnimationQueue.ts` | 141 | KEEP - Animation lifecycle |
| `components/GameBoard/AnimationOverlay.tsx` | 167 | KEEP - Clean component |
| `types/game.ts` | ~100 | KEEP - Type definitions |
| All tests | ~600 | KEEP - Regression prevention |

## What We're Rebuilding

| File | Lines | Reason |
|------|-------|--------|
| `components/GameBoard/index.tsx` | 660 | Dual-state system, legacy code paths |
| `components/GameProvider/index.tsx` | 593 | Simplify to use reducer, remove local state |

## What We're Deleting

- All `useState` for board/animation state in GameBoard
- Legacy `addCardToBoard` function
- Legacy `startAnimation` function
- Refs: `animatingCardIdRef`, `lastProcessedServerCardRef`
- Global state sync for selectedCard/gameState (use context directly)

---

## Architecture (New)

```
                    WebSocket
                        │
                        ▼
                ┌───────────────┐
                │  GameProvider │ ─── dispatches ──▶ gameReducer
                │  (simplified) │
                └───────────────┘
                        │
                        │ useGame() provides:
                        │ - state (from reducer)
                        │ - dispatch
                        │ - players, timer, etc.
                        ▼
                ┌───────────────┐
                │   GameBoard   │ ─── reads state, dispatches moves
                │   (rebuilt)   │
                └───────────────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    ┌──────────────┐       ┌──────────────────┐
    │  BoardGrid   │       │ AnimationOverlay │
    │  (new)       │       │ (keep)           │
    └──────────────┘       └──────────────────┘
            │
            ▼
    ┌──────────────┐
    │  BoardCell   │
    │  (new)       │
    └──────────────┘
```

---

## Phases

### Phase 1: GameProvider Refactor (Day 1)
**Goal:** Move game state management to reducer, simplify provider

Tasks:
- [ ] 1.1 Add `useReducer(gameReducer)` to GameProvider
- [ ] 1.2 Dispatch `GAME_STATE_RECEIVED` when WS sends game-updated
- [ ] 1.3 Dispatch `SET_CURRENT_PLAYER` when user is known
- [ ] 1.4 Expose `state` and `dispatch` from useGame() hook
- [ ] 1.5 Remove: local `gameState` useState (use reducer state)
- [ ] 1.6 Remove: `isMyTurn` useState (derived from reducer)
- [ ] 1.7 Keep: players, timer, roomInfo, results (these are separate concerns)

**Validation:**
- App loads without errors
- Console shows game state updates via reducer logs

### Phase 2: GameBoard Rebuild (Day 2-3)
**Goal:** Clean GameBoard that ONLY uses reducer state

Tasks:
- [ ] 2.1 Create `components/GameBoard/BoardCell.tsx` (single cell component)
- [ ] 2.2 Create `components/GameBoard/BoardGrid.tsx` (renders grid from state.board)
- [ ] 2.3 Create `components/GameBoard/CardStack.tsx` (renders stacked cards)
- [ ] 2.4 Rebuild `GameBoard/index.tsx`:
  - Use `state.board` from reducer (not local useState)
  - Use `state.pendingAnimation` for animations
  - Dispatch `LOCAL_MOVE_INITIATED` on card drop
  - NO legacy board state, NO legacy animation state
- [ ] 2.5 Integrate interact.js with proper cleanup
- [ ] 2.6 Remove global state module dependency (`utils/gameState.ts`)

**Validation:**
- Board renders from reducer state
- Placing a card dispatches action and updates board
- Animation plays once (not twice)

### Phase 3: Animation Integration (Day 3-4)
**Goal:** Smooth animations for both local and opponent moves

Tasks:
- [ ] 3.1 Connect AnimationOverlay to reducer's pendingAnimation
- [ ] 3.2 Verify useAnimationQueue hook triggers correctly
- [ ] 3.3 Test: local move → instant animation → server confirms
- [ ] 3.4 Test: opponent move → animation on state update
- [ ] 3.5 Verify score popup shows correct value from server

**Validation:**
- Play full game with 2 browser tabs
- Each card placement animates exactly once
- Scores display correctly

### Phase 4: Edge Cases & Polish (Day 4-5)
**Goal:** Handle all game scenarios

Tasks:
- [ ] 4.1 Auto-pass when no valid placements
- [ ] 4.2 Turn indicator (card tray color change)
- [ ] 4.3 Card placement validation (red flash on invalid)
- [ ] 4.4 Game end → results modal
- [ ] 4.5 Play again flow
- [ ] 4.6 Reconnection handling

**Validation:**
- E2E smoke tests pass
- Manual testing of full game flow

### Phase 5: Cleanup (Day 5)
**Goal:** Remove dead code, merge prep

Tasks:
- [ ] 5.1 Delete unused code from old GameBoard
- [ ] 5.2 Remove `utils/gameState.ts` if no longer needed
- [ ] 5.3 Update/add tests for new components
- [ ] 5.4 Run full test suite
- [ ] 5.5 Code review, PR prep

---

## File Structure (After Rebuild)

```
components/
├── GameBoard/
│   ├── index.tsx          # Main container (NEW - ~150 lines)
│   ├── BoardGrid.tsx      # Grid renderer (NEW - ~80 lines)
│   ├── BoardCell.tsx      # Single cell (NEW - ~100 lines)
│   ├── CardStack.tsx      # Stacked cards (NEW - ~60 lines)
│   └── AnimationOverlay.tsx  # (KEEP - 167 lines)
├── GameProvider/
│   └── index.tsx          # Simplified (REFACTOR - ~300 lines)
```

---

## Risk Mitigation

1. **Keep old code until new works:** Don't delete GameBoard until v2 is validated
2. **Feature flag:** Could add `USE_NEW_BOARD=true` env var to toggle
3. **Incremental commits:** Small commits for easy rollback
4. **Test at each phase:** Don't proceed until current phase validates

---

## Success Criteria

- [ ] Two players can complete a full game
- [ ] Animations play exactly once per move
- [ ] Correct player colors on cards
- [ ] Score popup shows server-calculated score
- [ ] No console errors during gameplay
- [ ] E2E smoke tests pass
- [ ] Code is ~50% smaller than current GameBoard

---

## Commands

```bash
# Run dev server
yarn dev

# Run unit tests
yarn test

# Run E2E tests (need test tokens)
TEST_TOKEN_1=xxx TEST_TOKEN_2=yyy yarn test:smoke

# Type check
yarn lint:tsc
```
