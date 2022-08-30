import { FC, HTMLAttributes, useEffect, useState } from "react";

export type Props = HTMLAttributes<HTMLDivElement>;
import Link from "../Link";
import Line from "../Line";
import Text from "../Text";
import StatBlock from "../../components/StatBlock";

import { api } from "../../api";
import { useAuth } from "../AuthProvider";
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
    if (user.isTwitterConnected && !user.isMetamaskConnected) {
      return `@${user.username}`
    }
    if (!user.isTwitterConnected && user.isMetamaskConnected) {
      return `${user.username}`
    }
    return `@${user.username} ・ ${user && user.metamask && user.metamask.address}`
  }

  const getGreeting = () => {
    if (user.isTwitterConnected) {
      return `GM, ${user.name}!`
    }
    if (!user.isTwitterConnected && user.isMetamaskConnected) {
      return `GM!`
    }
  }


  useEffect(() => {
    if (!user.userId) {
      return;
    }
    getUserStats(user.userId)
      .then((data: any) => {
        console.log("User Stats: ", data);
        setUserStats(data);


        if (data.gamesPlayed === 0) {
          localStorage.setItem('show-rules-modal', 'true')
        }
      })
      .catch((err: any) => {
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
    >
      <div css={{ display: "flex", justifyContent: "space-between" }}>
        <Text
          component="h1"
          css={{
            margin: "0",
            marginTop: "0",
            fontSize: "50px",
            verticalAlign: "bottom",
          }}
        >
          {getGreeting()}
        </Text>
        <Text
          component="h1"
          css={{
            margin: "0",
            marginTop: "0",
            marginRight: 12,
            fontSize: "50px",
            verticalAlign: "bottom",
          }}
        >
          {userStats.skill}
        </Text>
      </div>

      <div css={{ display: "flex", justifyContent: "space-between" }}>
        <Text css={{color: 'rgba(255, 255, 255, 0.5)'}}> {getUsername()}</Text>
        <Text css={{color: 'rgba(255, 255, 255, 0.5)'}}>Your Skill</Text>
      </div>

      <Line spacing={4} />
      <Button
      style={{
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
