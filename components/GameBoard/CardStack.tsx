/**
 * CardStack Component
 *
 * Renders a stack of cards at a board position.
 * Each card in the stack is slightly rotated for a stacked effect.
 */

import { FC } from 'react';
import Card from '../CardNew';
import { getCard } from '../Cards';
import { NormalizedCard, GamePlayer } from '../../types/game';

interface CardStackProps {
  cards: NormalizedCard[];
  players: GamePlayer[];
  rowIndex: number;
  columnIndex: number;
  isMyTurn: boolean;
  hasError: boolean;
  lastPlayedCard: NormalizedCard | null;
  selectedCard: unknown;
  onCellClick: () => void;
}

/**
 * Check if this card position matches the last played card position
 */
function isLastPlayedPosition(
  card: NormalizedCard,
  lastPlayedCard: NormalizedCard | null,
  isTopCard: boolean
): boolean {
  if (!lastPlayedCard || !isTopCard) {
    return false;
  }
  const suitMatch = lastPlayedCard.suit?.toLowerCase() === card.suit?.toLowerCase();
  const valueMatch = String(lastPlayedCard.value).toLowerCase() === String(card.value).toLowerCase();
  return suitMatch && valueMatch;
}

/**
 * Get player color by userId
 */
function getPlayerColor(players: GamePlayer[], userId: string): string {
  if (userId === 'system') {
    return '#2D3038';
  }
  const player = players.find((p) => p.userId === userId);
  return player?.color || 'gray';
}

/**
 * Get rotation transform for stacked cards
 */
function getCardRotation(index: number): string {
  if (!index || index === 0) {
    return '';
  }
  return `rotate(${index * 4}deg)`;
}

const CardStack: FC<CardStackProps> = ({
  cards,
  players,
  rowIndex,
  columnIndex,
  isMyTurn,
  hasError,
  lastPlayedCard,
  selectedCard,
  onCellClick,
}) => {
  return (
    <div className="stack">
      {cards.map((card, index) => {
        const isTopCard = index === cards.length - 1;
        const playerColor = getPlayerColor(players, card.userId || '');
        const rotation = getCardRotation(index);
        // Hide card if it's the last played (animation overlay shows it instead)
        const isHiddenByAnimation = isLastPlayedPosition(card, lastPlayedCard, isTopCard);

        // Transform NormalizedCard to Card component's expected format
        const cardWithImage = getCard(card.suit, card.value, card);
        const cardForComponent = cardWithImage || {
          ...card,
          img: card.imageUrl || '',
          video: card.videoUrl,
        };

        return (
          <Card
            selectedCard={selectedCard}
            key={`${card.value}-${card.suit}-${index}`}
            onClick={onCellClick}
            animated={card.isNft === true}
            card={cardForComponent}
            index={index}
            className={isTopCard ? 'dropzone' : ''}
            id={`${rowIndex}-${columnIndex}`}
            data-row={rowIndex}
            data-column={columnIndex}
            isGameBoard={true}
            css={{
              pointerEvents: isMyTurn ? 'unset' : 'none',
              zIndex: 10 + index,
              outline: isTopCard && hasError
                ? '#FA5252 3px solid'
                : `3px solid ${playerColor}`,
              borderRadius: 16,
              position: 'relative',
              // Hide if animation overlay is showing this card
              opacity: isHiddenByAnimation ? 0 : 1,
              transition: 'all 300ms',
              transform: rotation,
              // Hover effect when dragging a card over this stack
              '&.drop-target': {
                transform: `${rotation} scale(1.05)`,
                boxShadow: '0 0 20px 8px rgba(0, 255, 0, 0.5)',
              },
              // Error overlay
              '&::before': {
                transition: 'all 300ms',
                position: 'absolute',
                content: `' '`,
                background: 'rgba(0, 0, 0, 0.75)',
                zIndex: 99999,
                borderRadius: 20,
                backgroundImage:
                  'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzIxMTZfMjU1MCkiPgo8cGF0aCBkPSJNMjUgMEMyMC4wNTU1IDAgMTUuMjIyIDEuNDY2MjIgMTEuMTEwOCA0LjIxMzI2QzYuOTk5NTMgNi45NjAyOSAzLjc5NTIxIDEwLjg2NDggMS45MDMwMiAxNS40MzI5QzAuMDEwODMyMiAyMC4wMDExIC0wLjQ4NDI1MSAyNS4wMjc3IDAuNDgwMzc5IDI5Ljg3NzNDMS40NDUwMSAzNC43MjY4IDMuODI2MDMgMzkuMTgxNCA3LjMyMjM0IDQyLjY3NzdDMTAuODE4NyA0Ni4xNzQgMTUuMjczMiA0OC41NTUgMjAuMTIyOCA0OS41MTk2QzI0Ljk3MjMgNTAuNDg0MyAyOS45OTg5IDQ5Ljk4OTIgMzQuNTY3MSA0OC4wOTdDMzkuMTM1MyA0Ni4yMDQ4IDQzLjAzOTcgNDMuMDAwNSA0NS43ODY3IDM4Ljg4OTNDNDguNTMzOCAzNC43NzggNTAgMjkuOTQ0NSA1MCAyNUM0OS45OTI4IDE4LjM3MTggNDcuMzU2NiAxMi4wMTcxIDQyLjY2OTggNy4zMzAyNUMzNy45ODI5IDIuNjQzMzkgMzEuNjI4MiAwLjAwNzE2ODkyIDI1IDBWMFpNMjUgNDUuODMzM0MyMC44Nzk2IDQ1LjgzMzMgMTYuODUxNyA0NC42MTE1IDEzLjQyNTYgNDIuMzIyM0M5Ljk5OTYxIDQwLjAzMzEgNy4zMjkzNSAzNi43Nzk0IDUuNzUyNTIgMzIuOTcyNkM0LjE3NTcgMjkuMTY1OCAzLjc2MzEzIDI0Ljk3NjkgNC41NjY5OCAyMC45MzU2QzUuMzcwODQgMTYuODk0MyA3LjM1NTAzIDEzLjE4MjIgMTAuMjY4NiAxMC4yNjg2QzEzLjE4MjIgNy4zNTUwMSAxNi44OTQ0IDUuMzcwODMgMjAuOTM1NiA0LjU2Njk3QzI0Ljk3NjkgMy43NjMxMSAyOS4xNjU4IDQuMTc1NjggMzIuOTcyNiA1Ljc1MjUxQzM2Ljc3OTQgNy4zMjkzNCA0MC4wMzMxIDkuOTk5NiA0Mi4zMjIzIDEzLjQyNTZDNDQuNjExNSAxNi44NTE2IDQ1LjgzMzMgMjAuODc5NiA0NS44MzMzIDI1QzQ1LjgyNzMgMzAuNTIzNSA0My42MzA0IDM1LjgxOSAzOS43MjQ3IDM5LjcyNDdDMzUuODE5IDQzLjYzMDQgMzAuNTIzNSA0NS44MjczIDI1IDQ1LjgzMzNaIiBmaWxsPSIjRkU1NjIxIi8+CjxwYXRoIGQ9Ik0zNC44MDYxIDE1LjE5MzhDMzQuNDE1NSAxNC44MDMyIDMzLjg4NTYgMTQuNTgzOCAzMy4zMzMyIDE0LjU4MzhDMzIuNzgwOCAxNC41ODM4IDMyLjI1MSAxNC44MDMyIDMxLjg2MDMgMTUuMTkzOEwyNC45OTk5IDIyLjA1NDJMMTguMTM5NSAxNS4xOTM4QzE3Ljk0NzMgMTQuOTk0OCAxNy43MTc0IDE0LjgzNjEgMTcuNDYzMiAxNC43MjY5QzE3LjIwOTEgMTQuNjE3NyAxNi45MzU3IDE0LjU2MDIgMTYuNjU5MSAxNC41NTc4QzE2LjM4MjQgMTQuNTU1NCAxNi4xMDgxIDE0LjYwODEgMTUuODUyMSAxNC43MTI5QzE1LjU5NiAxNC44MTc2IDE1LjM2MzQgMTQuOTcyMyAxNS4xNjc4IDE1LjE2NzlDMTQuOTcyMiAxNS4zNjM1IDE0LjgxNzUgMTUuNTk2MiAxNC43MTI4IDE1Ljg1MjJDMTQuNjA4IDE2LjEwODIgMTQuNTU1MyAxNi4zODI2IDE0LjU1NzcgMTYuNjU5MkMxNC41NjAxIDE2LjkzNTggMTQuNjE3NiAxNy4yMDkyIDE0LjcyNjggMTcuNDYzM0MxNC44MzU5IDE3LjcxNzUgMTQuOTk0NyAxNy45NDc0IDE1LjE5MzYgMTguMTM5NkwyMi4wNTQxIDI1TDE1LjE5MzYgMzEuODYwNEMxNC45OTQ3IDMyLjA1MjYgMTQuODM1OSAzMi4yODI1IDE0LjcyNjggMzIuNTM2N0MxNC42MTc2IDMyLjc5MDggMTQuNTYwMSAzMy4wNjQyIDE0LjU1NzcgMzMuMzQwOEMxNC41NTUzIDMzLjYxNzUgMTQuNjA4IDMzLjg5MTggMTQuNzEyOCAzNC4xNDc4QzE0LjgxNzUgMzQuNDAzOSAxNC45NzIyIDM0LjYzNjUgMTUuMTY3OCAzNC44MzIxQzE1LjM2MzQgMzUuMDI3NyAxNS41OTYgMzUuMTgyNCAxNS44NTIxIDM1LjI4NzFDMTYuMTA4MSAzNS4zOTE5IDE2LjM4MjQgMzUuNDQ0NiAxNi42NTkxIDM1LjQ0MjJDMTYuOTM1NyAzNS40Mzk4IDE3LjIwOTEgMzUuMzgyMyAxNy40NjMyIDM1LjI3MzFDMTcuNzE3NCAzNS4xNjM5IDE3Ljk0NzMgMzUuMDA1MiAxOC4xMzk1IDM0LjgwNjNMMjQuOTk5OSAyNy45NDU4TDMxLjg2MDMgMzQuODA2M0MzMi4yNTMyIDM1LjE4NTggMzIuNzc5NSAzNS4zOTU3IDMzLjMyNTcgMzUuMzkxQzMzLjg3MiAzNS4zODYyIDM0LjM5NDUgMzUuMTY3MSAzNC43ODA4IDM0Ljc4MDlDMzUuMTY3IDM0LjM5NDYgMzUuMzg2MSAzMy44NzIxIDM1LjM5MDkgMzMuMzI1OEMzNS4zOTU2IDMyLjc3OTYgMzUuMTg1NiAzMi4yNTMzIDM0LjgwNjEgMzEuODYwNEwyNy45NDU3IDI1TDM0LjgwNjEgMTguMTM5NkMzNS4xOTY3IDE3Ljc0ODkgMzUuNDE2MSAxNy4yMTkxIDM1LjQxNjEgMTYuNjY2N0MzNS40MTYxIDE2LjExNDIgMzUuMTk2NyAxNS41ODQ0IDM0LjgwNjEgMTUuMTkzOFoiIGZpbGw9IiNGRTU2MjEiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8yMTE2XzI1NTAiPgo8cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==)',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                opacity: hasError ? 1 : 0,
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              },
              // NFT power level badge
              '&::after': {
                opacity: card.isNft ? 1 : 0,
                content: `"${card.powerLevel}"`,
                display: card ? 'flex' : 'none',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 400ms',
                zIndex: 999 + index,
                transform: rotation,
                color: '#fff',
                fontFamily: 'Aldrich',
                background: playerColor,
                backgroundImage:
                  'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAxNCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzLjkxNzIgNy4zMTE4Mkw3LjU1MzU3IDE4Ljc2NjRDNy40MzkwMyAxOC45NyA3LjIyOTAzIDE5LjA5MDkgNi45OTk5NCAxOS4wOTA5QzYuOTQ5MDMgMTkuMDkwOSA2Ljg5MTc1IDE5LjA4NDUgNi44NDA4NCAxOS4wNzE4QzYuNTYwODQgMTguOTk1NCA2LjM2MzU3IDE4Ljc0NzMgNi4zNjM1NyAxOC40NTQ1VjExLjQ1NDVIMC42MzYzMDFDMC40MTk5MzggMTEuNDU0NSAwLjIyMjY2NSAxMS4zNDY0IDAuMTAxNzU2IDExLjE2ODJDLTAuMDEyNzg5NSAxMC45OSAtMC4wMzE4ODAzIDEwLjc2MDkgMC4wNTA4NDY5IDEwLjU2MzZMNC41MDUzOSAwLjM4MTgxOEM0LjYwNzIxIDAuMTUyNzI3IDQuODM2MyAwIDUuMDkwODUgMEg4LjkwOTAzQzkuMTE5MDMgMCA5LjMxNjMgMC4xMDE4MTggOS40MzcyMSAwLjI4QzkuNTUxNzUgMC40NTE4MTggOS41NzcyMSAwLjY3NDU0NSA5LjUwMDg0IDAuODcxODE4TDcuMzA1MzkgNi4zNjM2M0gxMy4zNjM2QzEzLjU4NjMgNi4zNjM2MyAxMy43OTYzIDYuNDg0NTQgMTMuOTEwOCA2LjY3NTQ1QzE0LjAyNTQgNi44NzI3MiAxNC4wMzE4IDcuMTE0NTQgMTMuOTE3MiA3LjMxMTgyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '12px 8px',
                position: 'absolute',
                borderRadius: 20,
                fontSize: 24,
                top: -10,
                right: 0,
                left: 160,
                padding: '14px 0',
                paddingTop: 18,
                paddingLeft: 20,
                width: 40,
                minWidth: 62,
                height: 38,
                pointerEvents: 'none',
                textTransform: 'uppercase',
              },
            }}
          />
        );
      })}
    </div>
  );
};

export default CardStack;
