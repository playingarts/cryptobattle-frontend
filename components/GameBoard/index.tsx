import { FC, useState, useEffect, useCallback, HTMLAttributes } from "react";
import Card from "../../components/CardNew";
import { getCard } from "../../components/Cards";

import CardEmpty from "../../components/CardEmpty";
import { useGame } from "../GameProvider";
import { useWS } from "../WsProvider";

interface Props extends HTMLAttributes<HTMLElement> {
  selectedCard?: string;
  removeCard?: (cardId: string) => void;
}

const GameBoard: FC<Props> = ({ children, selectedCard, removeCard }) => {

  const WSProvider = useWS()




  const generateBoard = (x: number, y: number) => {
    const columns : any = Array(x)
      .fill(0)
      .map(() => null);

    const rows : any = Array(y)
      .fill(0)
      .map(() => [...columns]);

    return rows
  };
  const { gameState } = useGame();


  const [board, setBoard] = useState(generateBoard(7, 5));

  const addCard = useCallback(
    (rowIndex, columnIndex, card = selectedCard) =>
      () => {

        console.log ("Playing card: ", card)
        WSProvider.send(
          JSON.stringify({
            event: "play-card",
            data: {
              action: 'move',
              x: rowIndex,
              y: columnIndex,
              suit: card.suit,
              value: card.value
            },
          })
        );
      },
    [WSProvider, selectedCard]
  );

  const addCardOnce = (rowIndex: number, columnIndex: number, card: any = selectedCard) => {

    const row = Number(rowIndex);
    const column = Number(columnIndex);

    const localBoard = [...board];

    localBoard[row][column] = card;
    
    console.log(localBoard[row][column + 1]);
    if (
      localBoard[row][column + 1] !== undefined &&
      localBoard[row][column + 1] === null
    ) {
      localBoard[row][column + 1] = "empty";
    }

    if (
      localBoard[row][column - 1] !== undefined &&
      localBoard[row][column - 1] === null
    ) {
      localBoard[row][column - 1] = "empty";
    }

    if (
      localBoard[row - 1] !== undefined &&
      localBoard[row - 1][column] === null
    ) {
      localBoard[row - 1][column] = "empty";
    }

    if (
      localBoard[row + 1] !== undefined &&
      localBoard[row + 1][column] === null
    ) {
      localBoard[row + 1][column] = "empty";
    }
    console.log(localBoard);

    setBoard(localBoard);

    console.log(board);

    removeCard ? removeCard(card) : null;
  };

  useEffect(() => {
    // console.log(gameState)

    if (!gameState) {
      return;
    }
    const tableCards = gameState.gameTableCards?.additionalProperties;
    console.log("tableCards", tableCards);
    if (!tableCards) {
      return;
    }

    Object.keys(tableCards).forEach((key) => {
      const cards = gameState.gameTableCards?.additionalProperties;
      const indexes = key.split("-");
      const card = getCard(cards[key][0].suit, cards[key][0].value);
      addCardOnce(Number(indexes[1]), Number(indexes[0]), card);
      console.log(board);
    });
  }, [gameState]);

  return (
    <div
      css={() => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px",
        minHeight: "100vh",
      })}
    >
      <div>
        {board.map((row: any, rowIndex: number) => {
          return (
            <div
              key={rowIndex}
              css={() => ({
                display: "flex",
                justifyContent: "center",
              })}
            >
              {row.map((column: any, columnIndex: number) => {
                return (
                  <div
                    css={() => ({
                      margin: column ? "10px" : "10px",
                    })}
                    key={columnIndex}
                  >
                    {!column && (
                      <div style={{ width: "210px", height: "300px" }}></div>
                    )}
                    {column === "empty" && (
                      <CardEmpty
                        onClick={addCard(rowIndex, columnIndex)}
                      ></CardEmpty>
                    )}
                    {column?.value && (
                      <Card animated={true} card={column}></Card>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
};

export default GameBoard;
