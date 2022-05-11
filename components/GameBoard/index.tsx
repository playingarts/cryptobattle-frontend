import { FC, useState, useCallback, HTMLAttributes } from "react";
import Card from "../../components/CardNew";
import CardEmpty from "../../components/CardEmpty";

interface Props extends HTMLAttributes<HTMLElement> {
  selectedCard?: string;
}

const Card3H = {
  img:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/3-h-4J4x76NB.jpg",
  video:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/3-h-4J4x76NB.mp4",
};

const Card2H = {
  img:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/game/2-h-4si4nh43.jpg",
  video:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/2-h-4si4nh43.mp4",
};

const CardQC = {
  img:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/game/q-c-jE72m69y.jpg",
  video:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/q-c-jE72m69y.mp4",
};

const CardKH = {
  img:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/game/k-h-36QTB8R9.jpg",
  video:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/k-h-36QTB8R9.mp4",
};

const Card10S = {
  img:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/game/10-s-239yn6fp.jpg",
  video:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/10-s-239yn6fp.mp4",
};

const CardJD = {
  img:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/game/j-d-X37rjw98.jpg",
  video:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/j-d-X37rjw98.mp4",
};

const Card8H = {
  img:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/game/8-h-V3AR64f2.jpg",
  video:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/8-h-V3AR64f2.mp4",
};

const CardAS = {
  img:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/game/a-s-26vr86EL.jpg",
  video:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/a-s-26vr86EL.mp4",
};

const CardKD = {
  img:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/game/k-d-9ex8HW27.jpg",
  video:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/k-d-9ex8HW27.mp4",
};

const Card4C = {
  img:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/game/4-c-977Jh2ML.jpg",
  video:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/4-c-977Jh2ML.mp4",
};

const Card6D = {
  img:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/game/6-d-6mH3F99H.jpg",
  video:
    "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/6-d-6mH3F99H.mp4",
};

const GameBoard: FC<Props> = ({ children, selectedCard }) => {
  const [board, setBoard] = useState([
    [null, null, null, null, null],
    [null, null, "empty", null, null],
    [null, "empty", "Card3H", "empty", null],
    [null, null, "empty", null, null],
    [null, null, null, null, null],
  ]);

  const addCard = useCallback(
    (rowIndex, columnIndex) => () => {
      if (!selectedCard) {
        console.log("cancelling");
        return;
      }
      // props.onChange(selectedCard);
      const localBoard = [...board];
      localBoard[rowIndex][columnIndex] = selectedCard;

      if (
        localBoard[rowIndex][columnIndex + 1] !== undefined &&
        localBoard[rowIndex][columnIndex + 1] === null
      ) {
        localBoard[rowIndex][columnIndex + 1] = "empty";
      }

      if (
        localBoard[rowIndex][columnIndex - 1] !== undefined &&
        localBoard[rowIndex][columnIndex - 1] === null
      ) {
        localBoard[rowIndex][columnIndex - 1] = "empty";
      }

      if (
        localBoard[rowIndex - 1] !== undefined &&
        localBoard[rowIndex - 1][columnIndex] === null
      ) {
        localBoard[rowIndex - 1][columnIndex] = "empty";
      }

      if (
        localBoard[rowIndex + 1] !== undefined &&
        localBoard[rowIndex + 1][columnIndex] === null
      ) {
        localBoard[rowIndex + 1][columnIndex] = "empty";
      }

      setBoard(localBoard);
    },
    [selectedCard, board]
  ); // const addRow = (index) => board.rows.push(index)

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
        {board.map((row, rowIndex) => {
          return (
            <div
              key={rowIndex}
              // {...props}
              css={() => ({
                display: "flex",
                justifyContent: "center",
              })}
            >
              {row.map((column, columnIndex) => {
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
                    {column === "Card3H" && (
                      <Card animated={true} noInfo={true} card={Card3H}></Card>
                    )}

                    {column === "Card2H" && (
                      <Card animated={true} noInfo={true} card={Card2H}></Card>
                    )}
                    {column === "CardKH" && (
                      <Card animated={true} noInfo={true} card={CardKH}></Card>
                    )}

                    {column === "CardQC" && (
                      <Card animated={true} noInfo={true} card={CardQC}></Card>
                    )}
                    {column === "Card10S" && (
                      <Card animated={true} noInfo={true} card={Card10S}></Card>
                    )}
      
                    {column === "CardJD" && (
                      <Card animated={true} noInfo={true} card={CardJD}></Card>
                    )}

                    {column === "Card8H" && (
                      <Card animated={true} noInfo={true} card={Card8H}></Card>
                    )}
                    {column === "CardAS" && (
                      <Card animated={true} noInfo={true} card={CardAS}></Card>
                    )}
                    {column === "CardKD" && (
                      <Card animated={true} noInfo={true} card={CardKD}></Card>
                    )}

                    {column === "Card4C" && (
                      <Card animated={true} noInfo={true} card={Card4C}></Card>
                    )}
                    {column === "Card6D" && (
                      <Card animated={true} noInfo={true} card={Card6D}></Card>
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
