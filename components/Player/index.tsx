import {
  HTMLAttributes,
  FC,
  useEffect,
  useState,
  useCallback,
  forwardRef,
} from "react";
import { api } from "../../api";
import { useWS } from "../../components/WsProvider/index";
import { formatUsername } from "../../utils/helpers";

export type Props = HTMLAttributes<HTMLDivElement>;

import Text from "../Text";
import UserAvatar from "../../components/UserAvatar";
interface Player extends Props {
  player: { userId: string; state: string };
  color: string;
  isAdmin: boolean;
}
// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line
const Player: FC<Player> = forwardRef(({ color, player, isAdmin }, ref) => {
  const [playerInfo, setPlayerInfo] = useState({
    name: "",
    profilePictureUrl: "",
    username: "",
  });

  const WSProvider = useWS();

  const [hovered, setHover] = useState(false);

  const getUser = (playerId: string) => {
    if (!playerId) {
      return
    }
    return api.get(`/api/rest/user-info/${playerId}`);
  };

  const kickPlayer = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, userId: string) => {
      WSProvider.send(
        JSON.stringify({
          event: "kick-player",
          data: {
            userId,
          },
        })
      );
    },
    []
  );

  useEffect(() => {
    console.log('player', playerInfo)
    if (!playerInfo.username && player.userId) {
      getUser(player.userId)
        .then((data: any) => {
          setPlayerInfo(data);
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  }, [player, playerInfo]);

  return (
    // eslint-disable-next-line
    // @ts-ignore
    <div ref={ref} style={{ display: "flex", alignItems: "center" }}>
      <UserAvatar
        profilePictureUrl={playerInfo.profilePictureUrl}
        css={{ border: "solid 5px " + color }}
      />

      <div
        css={{
          borderRadius: "200px",
          width: "40px",
          height: "40px",
          background: color,
          marginLeft: "-10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // onMouseEnter={() => setHover(true)},
          // onMouseLeave={() => setHover(false)}
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {player.state === "ready" && (
          <svg
            width="16"
            height="12"
            viewBox="0 0 16 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 12C5.5 12 5 11.8 4.6 11.4L0.6 7.4C-0.2 6.6 -0.2 5.4 0.6 4.6C1.4 3.8 2.7 3.8 3.4 4.6L6 7.2L12.6 0.6C13.4 -0.2 14.6 -0.2 15.4 0.6C16.2 1.4 16.2 2.6 15.4 3.4L7.4 11.4C7 11.8 6.5 12 6 12Z"
              fill="white"
            />
          </svg>
        )}

        {hovered && isAdmin && (
          <div onClick={(e) => kickPlayer(e, player.userId)}>x</div>
        )}

        {player.state === "waiting" && (
          <div>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0C11.172 0 10.5 0.672 10.5 1.5V4.5C10.5 5.328 11.172 6 12 6C12.828 6 13.5 5.328 13.5 4.5V1.5C13.5 0.672 12.828 0 12 0ZM12 18C11.172 18 10.5 18.6705 10.5 19.5V22.5C10.5 23.3295 11.172 24 12 24C12.828 24 13.5 23.3295 13.5 22.5V19.5C13.5 18.6705 12.828 18 12 18ZM18.363 7.758L20.484 5.6355C21.0705 5.0505 21.0705 4.0995 20.484 3.5145C19.899 2.928 18.9495 2.928 18.363 3.5145L16.242 5.6355C15.6555 6.222 15.6555 7.1715 16.242 7.758C16.8285 8.343 17.778 8.343 18.363 7.758ZM5.6355 16.242L3.5145 18.363C2.928 18.9495 2.928 19.899 3.5145 20.484C4.0995 21.0705 5.049 21.0705 5.6355 20.484L7.7565 18.363C8.343 17.7765 8.343 16.8285 7.7565 16.242C7.1715 15.657 6.222 15.657 5.6355 16.242ZM5.6355 3.5145C5.049 2.928 4.0995 2.928 3.5145 3.5145C2.928 4.0995 2.928 5.0505 3.5145 5.6355L5.6355 7.758C6.222 8.343 7.1715 8.343 7.7565 7.758C8.343 7.1715 8.343 6.222 7.7565 5.6355L5.6355 3.5145ZM18.363 16.242C17.7765 15.6555 16.8285 15.6555 16.242 16.242C15.6555 16.8285 15.6555 17.7765 16.242 18.363L18.363 20.484C18.9495 21.0705 19.899 21.0705 20.484 20.484C21.0705 19.899 21.0705 18.9495 20.484 18.363L18.363 16.242ZM22.5 10.5H19.5C18.6705 10.5 18 11.172 18 12C18 12.828 18.6705 13.5 19.5 13.5H22.5C23.3295 13.5 24 12.828 24 12C24 11.172 23.3295 10.5 22.5 10.5ZM6 12C6 11.172 5.328 10.5 4.5 10.5H1.5C0.672 10.5 0 11.172 0 12C0 12.828 0.672 13.5 1.5 13.5H4.5C5.328 13.5 6 12.828 6 12Z"
                fill="white"
              />
            </svg>
          </div>
        )}
      </div>
      <div style={{ marginLeft: "10px" }}>
        <Text component="div" variant="label">
          {formatUsername(playerInfo.username)}
        </Text>

        {/* <div>LVL 04</div> */}
      </div>
    </div>
  );
});

export default Player;
