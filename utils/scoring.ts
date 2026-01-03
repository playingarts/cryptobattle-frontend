/**
 * Frontend Scoring Module
 *
 * Mirrors the backend scoring logic for optimistic score updates.
 * When a player drops a card, we calculate the expected score immediately
 * without waiting for the backend response.
 */

import { NormalizedCard, GameBoard } from '../types/game';

export interface TableCardInfo {
  suit: string;
  value: string;
  userId: string;
}

export interface TableCellInfo {
  cards: TableCardInfo[];
}

export interface ClusterCellInfo {
  x: number;
  y: number;
  stackHeight: number;
  isStolen: boolean;
}

/**
 * Get stepped multiplier based on cluster size
 * 1 cell = ×1, 2-3 cells = ×2, 4-5 cells = ×3, 6+ cells = ×4 (capped)
 */
export function getClusterMultiplier(clusterSize: number): number {
  if (clusterSize <= 1) return 1;
  if (clusterSize <= 3) return 2;
  if (clusterSize <= 5) return 3;
  return 4; // Capped at ×4
}

/**
 * Convert GameBoard to TableCellInfo format for scoring
 */
export function boardToTableCellInfo(board: GameBoard): TableCellInfo[][] {
  const tableCellInfo: TableCellInfo[][] = [];

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (!tableCellInfo[x]) {
        tableCellInfo[x] = [];
      }

      const cell = board[y][x];
      tableCellInfo[x][y] = {
        cards: cell.cards.map(card => ({
          suit: card.suit,
          value: card.value,
          userId: card.userId,
        })),
      };
    }
  }

  return tableCellInfo;
}

/**
 * Find all clusters for a player using flood fill algorithm
 */
export function findPlayerClusters(
  tableCellInfo: TableCellInfo[][],
  tableSize: { x: number; y: number },
  userId: string,
): Array<Array<ClusterCellInfo>> {
  const visited: boolean[][] = [];
  const clusters: Array<Array<ClusterCellInfo>> = [];

  // Initialize visited array
  for (let x = 0; x < tableSize.x; x++) {
    visited[x] = [];
    for (let y = 0; y < tableSize.y; y++) {
      visited[x][y] = false;
    }
  }

  // Check if cell belongs to player (top card is theirs)
  const belongsToPlayer = (x: number, y: number): boolean => {
    const cell = tableCellInfo[x]?.[y];
    if (!cell || !cell.cards.length) return false;
    const topCard = cell.cards[cell.cards.length - 1];
    return topCard.userId === userId;
  };

  // Check if cell was stolen (has cards from other users underneath)
  const isCellStolen = (x: number, y: number, ownerId: string): boolean => {
    const cell = tableCellInfo[x]?.[y];
    if (!cell || cell.cards.length <= 1) return false;
    // Check if any card (except top) belongs to a different user
    for (let i = 0; i < cell.cards.length - 1; i++) {
      if (cell.cards[i].userId !== ownerId) {
        return true;
      }
    }
    return false;
  };

  // Flood fill to find connected cells
  const floodFill = (
    startX: number,
    startY: number,
  ): Array<ClusterCellInfo> => {
    const cluster: Array<ClusterCellInfo> = [];
    const stack: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];

    while (stack.length > 0) {
      const { x, y } = stack.pop()!;

      if (x < 0 || x >= tableSize.x || y < 0 || y >= tableSize.y) continue;
      if (visited[x][y]) continue;
      if (!belongsToPlayer(x, y)) continue;

      visited[x][y] = true;
      const cell = tableCellInfo[x][y];
      cluster.push({
        x,
        y,
        stackHeight: cell.cards.length,
        isStolen: isCellStolen(x, y, userId),
      });

      // Add orthogonal neighbors
      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }

    return cluster;
  };

  // Find all clusters
  for (let x = 0; x < tableSize.x; x++) {
    for (let y = 0; y < tableSize.y; y++) {
      if (!visited[x][y] && belongsToPlayer(x, y)) {
        const cluster = floodFill(x, y);
        if (cluster.length > 0) {
          clusters.push(cluster);
        }
      }
    }
  }

  return clusters;
}

/**
 * Calculate score for a single cluster
 * - Own cells (not stolen): count as 1
 * - Stolen cells (has opponent cards underneath): count as 2 (fixed bonus)
 * Score = multiplier × (own cells + stolen cell bonuses)
 */
export function calculateClusterScore(
  cluster: Array<ClusterCellInfo>,
): number {
  const clusterSize = cluster.length;

  // Calculate effective points: own cells = 1, stolen cells = 2 (fixed bonus)
  let effectivePoints = 0;
  for (const cell of cluster) {
    if (cell.isStolen) {
      effectivePoints += 2; // Fixed bonus instead of stack height to prevent snowballing
    } else {
      effectivePoints += 1;
    }
  }

  const multiplier = getClusterMultiplier(clusterSize);
  return multiplier * effectivePoints;
}

/**
 * Calculate points for a specific player
 */
export function calculatePlayerPoints(
  tableCellInfo: TableCellInfo[][],
  tableSize: { x: number; y: number },
  userId: string,
): number {
  const clusters = findPlayerClusters(tableCellInfo, tableSize, userId);
  let totalScore = 0;

  for (const cluster of clusters) {
    totalScore += calculateClusterScore(cluster);
  }

  return totalScore;
}

/**
 * Calculate points for all players on the board
 */
export function calculatePlayersPoints(
  tableCellInfo: TableCellInfo[][],
  tableSize: { x: number; y: number },
): Record<string, number> {
  const playersPoints: Record<string, number> = {};
  const playerIds = new Set<string>();

  // Collect all unique player IDs (from top cards only)
  for (let x = 0; x < tableSize.x; x++) {
    for (let y = 0; y < tableSize.y; y++) {
      const cell = tableCellInfo[x]?.[y];
      if (cell && cell.cards.length) {
        const topCard = cell.cards[cell.cards.length - 1];
        if (topCard.userId && topCard.userId !== 'system') {
          playerIds.add(topCard.userId);
        }
      }
    }
  }

  // Calculate score for each player
  Array.from(playerIds).forEach((userId) => {
    playersPoints[userId] = calculatePlayerPoints(tableCellInfo, tableSize, userId);
  });

  return playersPoints;
}

/**
 * Calculate optimistic scores after a card is placed
 * This is used for immediate UI feedback before backend confirms
 */
export function calculateOptimisticScores(
  board: GameBoard,
  newCard: NormalizedCard,
  position: { x: number; y: number },
): Record<string, number> {
  // Convert board to table cell info format
  const tableCellInfo = boardToTableCellInfo(board);

  // Add the new card to the position
  if (!tableCellInfo[position.x]) {
    tableCellInfo[position.x] = [];
  }
  if (!tableCellInfo[position.x][position.y]) {
    tableCellInfo[position.x][position.y] = { cards: [] };
  }
  tableCellInfo[position.x][position.y].cards.push({
    suit: newCard.suit,
    value: newCard.value,
    userId: newCard.userId,
  });

  // Calculate new scores
  const tableSize = {
    x: board[0]?.length || 7,
    y: board.length || 5,
  };

  return calculatePlayersPoints(tableCellInfo, tableSize);
}
