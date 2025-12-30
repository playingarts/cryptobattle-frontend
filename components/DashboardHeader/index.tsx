import { FC, HTMLAttributes, useEffect, useState } from "react";

export type Props = HTMLAttributes<HTMLDivElement>;
import Link from "../Link";
import Line from "../Line";
import Text from "../Text";
import StatBlock from "../../components/StatBlock";

import { api } from "../../api";
import { useAuth } from "../AuthProvider";
import { logError } from "../../utils/errorHandler";
// import Progress from '../../components/Progress';
import Button from "../Button/";

const getUserStats = (userId: string) => {
  return api.get("/api/rest/player-stats/" + userId);
};

const DashboardHeader: FC<Props> = ({ ...props }) => {
  const { user } = useAuth();

  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    level: 0,
    nftCardsTotalXp: 0,
    skill: 0,
    cardsStrength: 0,
  });

  const getUsername = () => {
    if (user.isMetamaskConnected && user.metamask?.address) {
      return `${user.username}`;
    }
    return user.username || '';
  };

  const getGreeting = () => {
    if (user.name) {
      // Simplify guest names: "Guest_mjqz71hl_jxkwp" -> "Guest"
      const displayName = user.name.startsWith('Guest_') ? 'Guest' : user.name;
      return `GM, ${displayName}!`;
    }
    return `GM!`;
  };

  useEffect(() => {
    if (!user.userId) {
      return;
    }
    getUserStats(user.userId)
      .then((data: any) => {
        setUserStats(data);
      })
      .catch((err: any) => {
        logError(err, 'DashboardHeader');
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
        margin: "20px auto",
        padding: "50px 70px",
        maxWidth: 1040,
      })}
    >
      <div css={{ display: "flex", justifyContent: "space-between" }}>
        
        <Text
          component="h1"
          css={{
            margin: "0",
            fontSize: "55px",
            verticalAlign: "bottom",
          }}
        >
          {getGreeting()}
        </Text>
        <Text
          component="h1"
          css={{
            margin: "0",
            fontSize: "55px",
            verticalAlign: "bottom",
            width: "90px",
            textAlign: "center",
          }}
        >
          {userStats.skill}
        </Text>
      </div>

      <div css={{ display: "flex", justifyContent: "space-between" }}>
        <Text
          css={{
            color: "rgba(255, 255, 255, 0.3)",
            fontSize: "18px",
            margin: "15px 0 10px",
          }}
        >
          {" "}
          {getUsername()}
        </Text>
        <Text
          css={{
            color: "rgba(255, 255, 255, 0.3)",
            width: "90px",
            textAlign: "center",
            fontSize: "18px",
            margin: "15px 0 10px",
          }}
        >
          Your Skill
        </Text>
      </div>

      <Line spacing={2} />
      <Button
        style={{
          marginTop: "10px",
          marginRight: "15px",
          background: "#7B61FF",
          color: "#fff",
        }}
        component={Link}
        href="/new"
      >
        New Game
      </Button>
    </StatBlock>
  );
};

export default DashboardHeader;
