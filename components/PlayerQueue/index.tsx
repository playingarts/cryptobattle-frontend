import { FC, HTMLAttributes,createRef} from "react";

import UserAvatar from "../UserAvatar";
import { useState, useEffect } from "react";
export type Props = HTMLAttributes<HTMLDivElement>;
import { formatUsername } from "../../utils/helpers";

interface PlayerQueue extends Props {
  playersWithPoints: any;
  loadingDelayed: boolean;
}

const PlayerQueue: FC<PlayerQueue> = ({
  loadingDelayed,
  playersWithPoints,
}) => {
  const [players, setPlayers] = useState([]);
  // const [order, setOrder] = useState([]);

  useEffect(() => {
    console.log(playersWithPoints)

    if (playersWithPoints.length  === 0 ) {
      return
    }
  
    setPlayers(playersWithPoints);
  }, [playersWithPoints]);


  // useEffect(() => {
  //   setOrder(playersWithPoints.map((player:any) => player.userId));

  // }, [ playersWithPoints]);


  // useEffect(() => {
  //   console.log(order, 'order')
  // }, [order]);
  // useEffect(() => {
  //   const currentPlayer =  players[0]

  //   const shiftArray = (arr: any, target: any) => {
  //     return arr.concat(arr.splice(0, arr.indexOf(target)));
  //   }

  //   console.log(playersWithPoints)

  //   const playersSorted = shiftArray(playersWithPoints, currentPlayer)

  //   console.log(playersSorted)

  //   setPlayers([playersSorted]);
  // }, [order, playersWithPoints]);

  return (
    <div
      className="all-slides"
      css={{
        display: "flex",
        justifyContent: "space-between",
        minWidth: 180,

        transition: "all 20s linear",
      }}
    >
    
      {players.map((player: any) => {
        return (
          <div
          ref={createRef()}
            className="single-slide"
            key={player.userId}
            css={{
              position: "relative",
              borderRadius: 9999,
              cursor: "default",
              opacity: loadingDelayed ? "0" : "1",
              transform: loadingDelayed
                ? "translate(1500px, 0)"
                : "translate(0, 0)",
              "&::after": {
                opacity: 0,
                content: `'${player.points}'`,
                display: "flex",
                lineHeight: 3,
                transition: "all 400ms",
                borderRadius: 9999,
                outline: "6px solid" + player.color,
                justifyContent: "center",
                alignItems: "center",
                fontSize: 60,
                fontFamily: "Aldrich",
                position: "absolute",
                color: "#fff",
                background: player.color,
                bottom: 0,
                top: 0,
                left: 0,
                right: 0,
                pointerEvents: "none",
              },
              "&::before": {
                opacity: 0,
                content: `'${formatUsername(player.username)}'`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 400ms",
                color: "black",
                fontFamily: "Aldrich",
                position: "absolute",
                background: "#ffff",
                borderRadius: 6,
                lineHeight: 3,

                fontSize: 18,
                zIndex: 9999,
                bottom: -40,
                left: "50%",
                transform: "translate(-50%, 0)",
                padding: "12px 14px",
                paddingTop: 16,
                minWidth: 70,
                height: 30,
                pointerEvents: "none",
                textTransform: "uppercase",
              },
              "&:hover": {
                "&::after": {
                  opacity: 1,
                  fontSize: 42,
                  pointerEvents: "none",
                  paddingTop: 10,
                },
                "&::before": {
                  opacity: 1,
                  pointerEvents: "none",
                  transform: "translate(-50%, 8px)",
                },
              },
            }}
          >
            <UserAvatar
              css={{
                outline: "6px solid" + player.color,
                zIndex: 999999,
                "&:hover": {
                  background: player.color,
                },
              }}
              profilePictureUrl={
                player.profilePictureUrl
                  ? player.profilePictureUrl
                  : player.profileImageUrl
              }
            />
          </div>
        );
      })}
   
    </div>
  );
};

export default PlayerQueue;
