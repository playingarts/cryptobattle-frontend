# GameBoard V2 Rebuild Plan

**Branch:** `rebuild/gameboard-v2`
**Goal:** Clean rebuild using ONLY reducer pattern - NO DUAL STATE

---

## Core Principle: NO DUAL STATE

Previous fix attempts failed because they added new code alongside old code, creating two state systems that fought each other. This rebuild is different:

> **When we switch, we switch completely. Delete the old, not "keep temporarily."**

| ❌ Old Pattern (Failed) | ✅ New Pattern |
|------------------------|----------------|
| Add reducer, keep useState "for now" | Add reducer, DELETE useState |
| Update consumers "later in Phase 2" | Update consumers in SAME commit |
| Two sources of truth | ONE source of truth |
| "Temporary" compatibility | Clean break |

---

## What We're Keeping (Copy, Don't Modify)

| File | Lines | Notes |
|------|-------|-------|
| `store/gameReducer.ts` | 461 | Well-tested, this IS the new state |
| `store/gameActions.ts` | 185 | Action types |
| `utils/moveUtils.ts` | ~150 | Pure utility functions |
| `hooks/useAnimationQueue.ts` | 141 | Animation lifecycle |
| `components/GameBoard/AnimationOverlay.tsx` | 167 | Clean, works with reducer |
| `types/game.ts` | ~100 | Type definitions |
| `store/__tests__/gameReducer.test.ts` | 478 | Regression tests |

## What We're Deleting (Not Modifying - Deleting)

From `GameProvider/index.tsx`:
- `useState` for: `gameState`, `isMyTurn`, `playersGame`
- useEffects that sync these states
- Any code that duplicates what reducer does

From `GameBoard/index.tsx`:
- `useState` for: `board`, `lastPlayedCard`, `cardError`
- `useReducer` (local) - will use context instead
- `animatingCardIdRef`, `lastProcessedServerCardRef`
- `addCardToBoard` function (legacy)
- `startAnimation` function (legacy)
- All useEffects that sync legacy state

From `utils/gameState.ts`:
- Entire file (global mutable state anti-pattern)

---

## Architecture (After Rebuild)

```
                    WebSocket Events
                           │
                           ▼
                   ┌──────────────────┐
                   │   GameProvider   │
                   │                  │
                   │  useReducer() ◄──┼─── SINGLE source of truth
                   │       │          │
                   │       ▼          │
                   │  dispatch()      │
                   └──────────────────┘
                           │
              useGame() returns { state, dispatch }
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌──────────────┐
    │ GameBoard  │  │ Inventory  │  │  pages/play  │
    │            │  │            │  │              │
    │ reads:     │  │ reads:     │  │ reads:       │
    │ state.board│  │ state.*    │  │ state.*      │
    └────────────┘  └────────────┘  └──────────────┘
```

**No arrows going backwards. No syncing. No dual state.**

---

## Phases (Revised)

### Phase 1: GameProvider + All Consumers (Day 1-2)
**Atomic change: reducer becomes the ONLY game state**

1. Add `useReducer(gameReducer)` to GameProvider
2. DELETE `gameState`, `isMyTurn`, `playersGame` useState
3. Update context type: `{ state, dispatch, ...roomStuff }`
4. Wire WS events to dispatch actions
5. Update GameBoard to read `state.board`, `state.isMyTurn`
6. Update GameInventory to read `state.serverState.turnForPlayer`
7. Update pages/play to read `state.serverState`
8. DELETE `utils/gameState.ts`
9. Test: app loads, game state flows through

**One commit. All or nothing.**

### Phase 2: GameBoard Component Split (Day 2-3)
**Make GameBoard maintainable**

1. Create `BoardCell.tsx` - single cell rendering
2. Create `CardStack.tsx` - stacked cards in a cell
3. Create `BoardGrid.tsx` - maps state.board to cells
4. Simplify `GameBoard/index.tsx` - container only
5. Clean up interact.js with proper lifecycle
6. Test: cards can be placed, animations work

### Phase 3: Animation Polish (Day 3-4)
**Ensure animations are bulletproof**

1. Verify AnimationOverlay reads from `state.pendingAnimation`
2. Test local move → animation → server confirm
3. Test opponent move → animation
4. Verify score popup shows correct value
5. Test rapid moves (no double animations)
6. Test: play full game, every move animates once

### Phase 4: Edge Cases (Day 4-5)
**Complete game flow**

1. Auto-pass when no valid placements
2. Game end → results modal
3. Play again flow
4. Reconnection: request state sync after WS reconnect
5. Error states: invalid placement feedback
6. Test: E2E smoke tests pass

### Phase 5: Cleanup & Merge (Day 5)
**Production ready**

1. Remove any dead code
2. Run full test suite
3. Manual QA with two browsers
4. PR review
5. Merge to main

---

## File Changes Summary

### Phase 1 Changeset (Atomic)

| File | Action | Key Changes |
|------|--------|-------------|
| `GameProvider/index.tsx` | MODIFY | Add reducer, delete gameState/isMyTurn/playersGame useState |
| `wsEventHandlers.ts` | MODIFY | Add dispatch param to handlers |
| `GameBoard/index.tsx` | MODIFY | Read state.board, delete local board useState |
| `GameInventory/index.tsx` | MODIFY | Read state.serverState.turnForPlayer |
| `pages/play/index.tsx` | MODIFY | Read state.serverState |
| `utils/gameState.ts` | DELETE | Remove global state anti-pattern |

### Phase 2 New Files

```
components/GameBoard/
├── index.tsx           # Simplified container (~150 lines)
├── BoardGrid.tsx       # NEW - grid renderer (~80 lines)
├── BoardCell.tsx       # NEW - single cell (~100 lines)
├── CardStack.tsx       # NEW - card stack (~60 lines)
└── AnimationOverlay.tsx # KEEP (~167 lines)
```

---

## Success Criteria

- [ ] Zero useState for game state in GameProvider
- [ ] Zero useState for board state in GameBoard
- [ ] `utils/gameState.ts` deleted
- [ ] Two players complete full game
- [ ] Every card placement animates exactly once
- [ ] Correct player colors on cards
- [ ] Score popup shows server value
- [ ] No console errors during gameplay
- [ ] All existing tests pass
- [ ] E2E smoke tests pass

---

## Rollback Strategy

Since we're on a branch:
- If Phase 1 fails badly → `git checkout main`
- If Phase 1 works but Phase 2 breaks → revert Phase 2 commits
- Feature flag NOT needed (branch provides isolation)

---

## Commands

```bash
# Development
yarn dev

# Type check (must pass before commit)
yarn lint:tsc

# Unit tests
yarn test

# E2E tests
TEST_TOKEN_1=xxx TEST_TOKEN_2=yyy yarn test:smoke

# Check what changed
git diff main --stat
```
