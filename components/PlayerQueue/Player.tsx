import { forwardRef, useState, useEffect, useRef } from "react";
import UserAvatar from "../UserAvatar";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { formatUsername } from "../../utils/helpers";
import { useGame } from "../GameProvider";

// Fixed display duration for all players (30 seconds)
const DISPLAY_DURATION_MS = 30000;
const UPDATE_INTERVAL_MS = 100; // Smooth updates every 100ms

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
    const turnStartTimeRef = useRef<number | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Only animate when counting down, not when resetting to 100%
    const shouldAnimate = progress < prevProgressRef.current

    const { results } = useGame()

    // Track when current player changes (new turn starts)
    const prevCurrentPlayerRef = useRef<string | null>(null)

    useEffect(() => {
      const currentPlayerId = currentPlayerWithPoints?.userId || null
      const isMyTurn = currentPlayerId === player.userId
      const turnChanged = currentPlayerId !== prevCurrentPlayerRef.current

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      // If game ended or no current player, show full
      if (!currentPlayerWithPoints || results) {
        setProgress(100)
        turnStartTimeRef.current = null
        prevCurrentPlayerRef.current = currentPlayerId
        return
      }

      // If it's not this player's turn, show full
      if (!isMyTurn) {
        setProgress(100)
        prevCurrentPlayerRef.current = currentPlayerId
        return
      }

      // It's this player's turn - start/continue countdown
      if (turnChanged) {
        // New turn started - reset timer
        turnStartTimeRef.current = Date.now()
        setProgress(100)
      }

      // Start countdown interval
      intervalRef.current = setInterval(() => {
        if (turnStartTimeRef.current === null) {
          return;
        }

        const elapsed = Date.now() - turnStartTimeRef.current
        const remaining = Math.max(0, DISPLAY_DURATION_MS - elapsed)
        const newProgress = (remaining / DISPLAY_DURATION_MS) * 100

        setProgress(newProgress)
      }, UPDATE_INTERVAL_MS)

      prevCurrentPlayerRef.current = currentPlayerId

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }, [currentPlayerWithPoints, player.userId, results])

    // Track previous progress for animation decision
    useEffect(() => {
      prevProgressRef.current = progress
    }, [progress])

    useEffect(() => {
      if (results) {
        setProgress(100)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
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
