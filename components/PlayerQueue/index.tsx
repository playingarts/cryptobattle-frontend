import { FC, HTMLAttributes } from "react";

import UserAvatar from "../UserAvatar";

export type Props = HTMLAttributes<HTMLDivElement>;

interface PlayerQueue extends Props {
    playersWithPoints:  any,
    loadingDelayed: boolean
  }

const PlayerQueue: FC<PlayerQueue> = ({loadingDelayed, playersWithPoints}) => {
  return (
    <div css={{display: 'flex', justifyContent: 'space-between', minWidth: 180, transition: "all 20s"}}>
    {
      playersWithPoints.map((player: any) => {
        return (
          <div
            className="game-player"
            key={player.userId}
            css={{
              position: "relative",
              borderRadius: 9999,
              cursor: 'default',
              opacity: loadingDelayed ? '0' : '1',
              transform: loadingDelayed ?  'translate(1500px, 0)' : 'translate(0, 0)' ,
              "&::after": {
                opacity: 0,
                content: `'${player.points}'`,
                display: "flex",
                lineHeight: 3,
                transition: 'all 400ms',
                borderRadius: 9999,
                outline: "6px solid" + player.color,
                justifyContent: "center",
                alignItems: "center",
                fontSize: 60,
                fontFamily: 'Aldrich',
                position: "absolute",
                color: "#fff",
                background: player.color,
                zIndex: 9999,
                bottom: 0,
                top: 0,
                left: 0,
                right: 0,
                pointerEvents: 'none',

              },
              "&::before": {
                opacity: 0,
                content: `'${player.username}'`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: 'all 400ms',
                color: "black",
                fontFamily: 'Aldrich',
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
                pointerEvents: 'none',
                textTransform: 'uppercase'
              },
              "&:hover": {
                "&::after": {
                  opacity: 1,
                  fontSize: 42,
                  pointerEvents: 'none',
                  paddingTop: 10,
                },
                "&::before": {
                  opacity: 1,
                  pointerEvents: 'none',
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
