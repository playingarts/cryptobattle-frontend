import { useState, useEffect, FC, HTMLAttributes, createRef } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { useGame } from "../GameProvider";
export type Props = HTMLAttributes<HTMLDivElement>;
import Player from "./Player";

// import AnimateBubbles from "../../pages/AnimateBubbles";
// import  from "../../pages/AnimateBubbles";

interface PlayerQueue extends Props {
  playersWithPoints: any;
  currentPlayerWithPoints: any;
  loadingDelayed: boolean;
}

const PlayerQueue: FC<PlayerQueue> = ({
  loadingDelayed,
  playersWithPoints,
  currentPlayerWithPoints,
}) => {
  const [players, setPlayers] = useState([]);
  const [inactivePlayers, setInactivePlayers] = useState<any>([]);

  const [order, setOrder] = useState([]);

  const { userSocketIdle } = useGame();

  useEffect(() => {
    if (!userSocketIdle) {
      return;
    }

    let players = [...inactivePlayers];

    if (
      players.find((player) => player.userId === userSocketIdle.userId) &&
      !userSocketIdle.isIdle
    ) {
      players = players.filter(
        (player) => player.userId !== userSocketIdle.userId
      );
    } 
      players.push(userSocketIdle);
    

    setInactivePlayers(players);
  }, [userSocketIdle, inactivePlayers, setInactivePlayers]);

  useEffect(() => {
    const shiftArray = (arr: any, target: any) => {
      // return arr
      return arr.concat(arr.splice(0, arr.indexOf(target)));
    };

    if (playersWithPoints.length === 0) {
      return;
    }

    setOrder(shiftArray(playersWithPoints, currentPlayerWithPoints));
  }, [playersWithPoints, currentPlayerWithPoints]);

  useEffect(() => {
    // if (playersWithPoints.length === 0) {
    //   return;
    // }

    //   console.log('indexOf',  playersWithPoints.indexOf(currentPlayerWithPoints) )

    setPlayers(order);
  }, [order]);

  // const shuffle = useCallback(() => {
  //   if (!players) {
  //     return;
  //   }

  //   const shiftArray = (arr: any, target: any) => {
  //     return arr.concat(arr.splice(0, arr.indexOf(target)));
  //   };

  //   setPlayers(shiftArray(players, players[1]));
  // }, [players]);

  //
  return (
    <div>
      {/* <div onClick={shuffle}>Shuffle </div> */}
      {/* <div  css={() => ({
        top: 200,
        left: 100,
        fontSize: "50px",
      })}>{timer}</div> */}
      <div className="bubbles-wrapper">
        <div className="bubbles-group"></div>
        {players.length > 0 && (
          <LayoutGroup>
            <div
              css={{
                display: "flex",
              }}
            >
              {players.map((player: any) => {
                return (
                  <motion.div
                    key={player.userId}
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Player
                      currentPlayerWithPoints={currentPlayerWithPoints}
                      player={player}
                      inactive={
                        inactivePlayers.find(
                          (inactivePlayer: any) =>
                            player.userId === inactivePlayer.userId
                        )?.isIdle
                      }
                      loadingDelayed={loadingDelayed}
                      ref={createRef()}
                    />
                  </motion.div>
                );
              })}
            </div>
          </LayoutGroup>
        )}
      </div>
    </div>
  );
};

export default PlayerQueue;
