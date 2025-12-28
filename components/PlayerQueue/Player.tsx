import { forwardRef, useState, useEffect, useRef } from "react";
import UserAvatar from "../UserAvatar";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { formatUsername } from "../../utils/helpers";
import { useGame } from "../GameProvider";

interface PlayerType {
  userId: string;
  color: string;
  points: number;
  username: string;
  profilePictureUrl?: string;
  profileImageUrl?: string;
}

interface PlayerProps {
  player: PlayerType;
  loadingDelayed?: boolean;
  currentPlayerWithPoints?: PlayerType | null;
  inactive?: boolean;
}

const Player = forwardRef<HTMLDivElement, PlayerProps>(
  ({ player, loadingDelayed, currentPlayerWithPoints, inactive }, ref) => {
    const [progress, setProgress] = useState(100)
    const prevProgressRef = useRef(100)
    // Only animate when counting down, not when resetting to 100%
    const shouldAnimate = progress < prevProgressRef.current

    const { timer, totalSeconds, results } = useGame()
    useEffect(() => {
      // Reset to full if no current player or game ended
      if (!currentPlayerWithPoints || results) {
        setProgress(100);
        return;
      }

      // Only show timer progress for the current player (whose turn it is)
      if (currentPlayerWithPoints.userId !== player.userId) {
        setProgress(100);
        return;
      }

      // Guard against division by zero
      if (totalSeconds <= 0) {
        setProgress(100);
        return;
      }

      // Calculate progress as percentage of time remaining
      const progressPercent = (timer / totalSeconds) * 100;

      // Debug: log timer values for current player
      console.log(`[TIMER ${player.username}] timer=${timer}, totalSeconds=${totalSeconds}, progress=${progressPercent.toFixed(1)}%`);

      setProgress(Math.max(0, Math.min(100, progressPercent)));
    }, [currentPlayerWithPoints, player, timer, totalSeconds, results])

    // Track previous progress for animation decision
    useEffect(() => {
      prevProgressRef.current = progress
    }, [progress])

    useEffect(() => {
      if (results) {
        setProgress(100)
      }

    }, [results])

    return (
      <div css={{marginRight: 10}} ref={ref}>
        <CircularProgressbarWithChildren
          styles={{
            // Customize the root svg element
            root: {},
            // Customize the path, i.e. the "completed progress"
            path: {
              // Path color
              stroke: inactive ? 'gray' : player.color,
              // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
              strokeLinecap: "butt",
              // Only animate countdown (progress decreasing), instant reset when increasing
              transition: shouldAnimate ? "stroke-dashoffset linear 1000ms" : "none",
              // Rotate the path
              transform: "rotate(0.25turn)",
              transformOrigin: "center center",
            },
            // Customize the circle behind the path, i.e. the "total progress"
            trail: {
              // Trail color
              stroke: "#0A0A0A",
              // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
              strokeLinecap: "butt",
              // Rotate the trail
              transform: "rotate(0.25turn)",
              transformOrigin: "center center",
            },
            // Customize the text
            text: {
              // Text color
              fill: "#f88",
              // Text size
              fontSize: "16px",
            },
            // Customize background - only used when the `background` prop is true
            background: {
              fill: "#3e98c7",
            },
          }}
          css={{ width: 70, height: 70 }}
          value={progress}
        >
          <div
            css={{
              borderRadius: 9999,
              cursor: "default",
              filter: inactive ? 'grayscale(100%)' : 'none',
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
                zIndex: 999999,
                paddingTop: 10,
                // outline: "6px solid" + player.color,
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
                // outline: "6px solid" + player.color,
                zIndex: 0,
                "&:hover": {
                  background: player.color,
                },
                transform: 'scale(0.84,0.84)'
              }}
              profilePictureUrl={
                player.profilePictureUrl || player.profileImageUrl || ''
              }
            />
          </div>
        </CircularProgressbarWithChildren>
      </div>
    );
  }
);

Player.displayName = 'Player';

export default Player;
