import { FC, HTMLAttributes, useEffect, useState } from "react";

export type Props = HTMLAttributes<HTMLDivElement>;
// import FaqItem from "../FaqItem";
import Line from "../Line";
import Text from "../Text";
import StatBlock from "../../components/StatBlock";

import axios from "axios";
import { useAuth } from "../AuthProvider";
// import Progress from '../../components/Progress';
import GameRules from "../GameRules/";

import Arrowed from "../Arrowed";
import StatsEntry from "./StatsEntry";

const getUserStats = (userId: string) => {
  // const params = {
  //   period: "week",
  //   page: 1,
  //   limit: 10,
  // };

  // PUB /api/rest/player-stats/{userId}

  return axios.get(
    "https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/api/rest/player-stats/" +
      userId,

    {
      headers: {
        accesstoken: localStorage.getItem("accessToken"),
        "content-type": "application/json",
      },
    }
  );
};

const Stats: FC<Props> = ({ ...props }) => {
  const { user } = useAuth();

  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    level: 0,
    nftCardsTotalXp: 0,
  });

  useEffect(() => {
    if (!user.userId) {
      return;
    }
    getUserStats(user.userId)
      .then(({ data }) => {
        console.log("User Stats: ", data);
        setUserStats(data);
      })
      .catch((err) => {
        console.log(err);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.userId]);

  return (
    <StatBlock
      {...props}
      css={(theme) => ({
        background: `#181818`,
        backgroundSize: "85%",
        color: theme.colors.text_title_light,
        position: "relative",
        margin: "20px 0",
        padding: "40px 80px",
      })}
      title="Your Stats"
    >
      <div css={() => ({ height: "280px" })}>
        <div
          css={() => ({
            display: "flex",
            justifyContent: "space-between",
          })}
        >
          <StatsEntry
            css={() => ({
              gridColumn: "span 3",
            })}
            title="level"
            number={userStats.level}
          />

          <StatsEntry
            css={() => ({
              gridColumn: "span 3",
            })}
            title="skill"
            number={19}
          />

          <StatsEntry
            css={() => ({
              gridColumn: "span 3",
            })}
            title="card strength"
            number={74}
          />
        </div>
        <Text variant="body2" css={{ opacity: 0.5 }}>
          {/* <Progress done='25' />
           */}
          You need to win at least 3 more games with 1 new player to get it to
          the level 3.
        </Text>
      </div>

      <Line spacing={4} />

      <GameRules>
        <Text variant="label" css={{ opacity: 0.5, cursor: "pointer" }}>
          <Arrowed>Game Rules</Arrowed>
        </Text>
      </GameRules>
    </StatBlock>
  );
};

export default Stats;
