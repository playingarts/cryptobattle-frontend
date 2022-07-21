import { FC, HTMLAttributes, useEffect } from "react";
// import { useAuth } from "../AuthProvider";
export type Props = HTMLAttributes<HTMLDivElement>;
import StatBlock from "../../components/StatBlock";
import { api } from "../../api";

import Line from "../Line";
import Text from "../Text";
import Arrowed from "../Arrowed";
import Leaderboard from "../Leaderboard";

const getLeaderboard = () => {
  const params = {
    period: "week",
    page: 1,
    limit: 10,
  };



  return api.get(`api/rest/leaderboard`, params)

};

const LeaderboardDashboard: FC<Props> = ({ ...props }) => {
  // const { user } = useAuth();

  useEffect(() => {
    getLeaderboard()
      .then((data: any) => {
        console.log(data);
      })
      .catch((err: any) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StatBlock
      {...props}
      css={(theme) => ({
        background: `#181818`,
        backgroundSize: "85%",
        color: theme.colors.text_title_light,
        position: "relative",
        margin: "20px 0",
      })}
      title="Top Players"
    >
      <div css={() => ({ height: "280px" })}>Player</div>

      <Line spacing={4} />
      <Leaderboard>
        <Text variant="label" css={{ opacity: 0.5, cursor: "pointer" }}>
          <Arrowed>Leaderboard</Arrowed>
        </Text>
      </Leaderboard>
    </StatBlock>
  );
};

export default LeaderboardDashboard;
