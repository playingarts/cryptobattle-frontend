import {
  useState,
  useEffect,
  FC,
  HTMLAttributes,
  createRef,
} from "react";
export type Props = HTMLAttributes<HTMLDivElement>;
import Player from "./Player";

import AnimateBubbles from "../../pages/AnimateBubbles";
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
  // const [order, setOrder] = useState([]);

  useEffect(() => {
    const shiftArray = (arr: any, target: any) => {
      return arr.concat(arr.splice(0, arr.indexOf(target)));
    };

    if (playersWithPoints.length === 0) {
      return;
    }

      setPlayers(shiftArray(playersWithPoints, currentPlayerWithPoints));
    


  }, [playersWithPoints, currentPlayerWithPoints]);

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

      <div className="bubbles-wrapper">
        <div className="bubbles-group"></div>
        {players.length > 0 && (
          <AnimateBubbles>
            {players.map((player: any) => {
              return (
                <Player
                  // eslint-disable-next-line 
                  // @ts-ignore
                  player={player}
                  loadingDelayed={loadingDelayed}
                  key={player.userId}
                  ref={createRef()}
                />
              );
            })}
          </AnimateBubbles>
        )}
      </div>
    </div>
  );
};

export default PlayerQueue;
