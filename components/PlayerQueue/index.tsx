import {
  useState,
  useEffect,
  FC,
  HTMLAttributes,
  createRef,
  useCallback
} from "react";
export type Props = HTMLAttributes<HTMLDivElement>;
import Player from "./Player";


// import AnimateBubbles from "../../pages/AnimateBubbles";
import { useGame } from "../GameProvider";
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
  const [order, setOrder] = useState([]);
const {gameState} = useGame()

  useEffect(() => {
    const shiftArray = (arr: any, target: any) => {
      // return arr
      return arr.concat(arr.splice(0, arr.indexOf(target)));
    };

    if (playersWithPoints.length === 0) {
      return;
    }

      console.log('indexOf',  playersWithPoints.indexOf(currentPlayerWithPoints) )
      console.log('indexOf',  currentPlayerWithPoints )

      setOrder(shiftArray(playersWithPoints, currentPlayerWithPoints));
    


  }, [playersWithPoints, currentPlayerWithPoints]);



  useEffect(() => {
 console.log('setting players', order)

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
    <div >
      {/* <div onClick={shuffle}>Shuffle </div> */}
      {/* <div  css={() => ({
        top: 200,
        left: 100,
        fontSize: "50px",
      })}>{timer}</div> */}
      <div   className="bubbles-wrapper">
        <div className="bubbles-group"></div>
        {players.length > 0 && (

          <div css={{display: 'flex', justifyContent:"space-between", width: players.length * 100}}>
          {/* // <AnimateBubbles> */}
            {players.map((player: any) => {
              return (
                <Player
                  // eslint-disable-next-line 
                  // @ts-ignore
                  currentPlayerWithPoints={currentPlayerWithPoints}
                  player={player}
                  loadingDelayed={loadingDelayed}
                  key={player.userId}
                  ref={createRef()}

                />
              );
            })}
            </div>
          // </AnimateBubbles>
        )}
      </div>
    </div>
  );
};

export default PlayerQueue;
