import { forwardRef, useState, useEffect, useRef, useCallback } from "react";
import UserAvatar from "../UserAvatar";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { formatUsername } from "../../utils/helpers";
import { useGame } from "../GameProvider";

// Fixed display duration for all players (30 seconds)
const DISPLAY_DURATION_MS = 30000;

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
    const turnStartTimeRef = useRef<number | null>(null)
    const rafRef = useRef<number | null>(null)
    const moveMadeThisTurnRef = useRef(false)

    const { results, state } = useGame()

    // Detect if player is a bot
    const isBot = player.username?.toLowerCase().includes('bot')

    // Track when current player changes (new turn starts)
    const prevCurrentPlayerRef = useRef<string | null>(null)

    // Check if this player has made a move (animation is pending for their card)
    const animationForThisPlayer = state.pendingAnimation?.playerId === player.userId

    // Once a move is detected, remember it for this turn
    if (animationForThisPlayer && !moveMadeThisTurnRef.current) {
      moveMadeThisTurnRef.current = true
    }

    // Animation loop using requestAnimationFrame for smooth 60fps
    const animate = useCallback(() => {
      if (turnStartTimeRef.current === null) {
        return;
      }

      const elapsed = Date.now() - turnStartTimeRef.current
      const remaining = Math.max(0, DISPLAY_DURATION_MS - elapsed)
      const newProgress = (remaining / DISPLAY_DURATION_MS) * 100

      setProgress(newProgress)

      // Continue animation
      rafRef.current = requestAnimationFrame(animate)
    }, [])

    useEffect(() => {
      const currentPlayerId = currentPlayerWithPoints?.userId || null
      const isMyTurn = currentPlayerId === player.userId
      const turnChanged = currentPlayerId !== prevCurrentPlayerRef.current

      // Cancel any existing animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }

      // If game ended or no current player, show full
      if (!currentPlayerWithPoints || results) {
        setProgress(100)
        turnStartTimeRef.current = null
        moveMadeThisTurnRef.current = false
        prevCurrentPlayerRef.current = currentPlayerId
        return
      }

      // If this player made a move this turn, stay frozen
      if (moveMadeThisTurnRef.current && isMyTurn) {
        // Stay frozen at current value until turn changes
        prevCurrentPlayerRef.current = currentPlayerId
        return
      }

      // If it's not this player's turn, reset to 100% and clear move flag
      if (!isMyTurn) {
        setProgress(100)
        moveMadeThisTurnRef.current = false
        prevCurrentPlayerRef.current = currentPlayerId
        return
      }

      // It's this player's turn - start/continue countdown
      if (turnChanged) {
        // New turn started - reset timer and clear move flag
        turnStartTimeRef.current = Date.now()
        moveMadeThisTurnRef.current = false
        setProgress(100)
      }

      // Start animation loop
      rafRef.current = requestAnimationFrame(animate)

      prevCurrentPlayerRef.current = currentPlayerId

      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
      }
    }, [currentPlayerWithPoints, player.userId, results, animationForThisPlayer, animate])

    useEffect(() => {
      if (results) {
        setProgress(100)
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
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
              // No CSS transition - we use requestAnimationFrame for smooth 60fps updates
              transition: "none",
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
              avatarBgColor={isBot ? '#4c4c4c' : undefined}
            />
          </div>
        </CircularProgressbarWithChildren>
      </div>
    );
  }
);

Player.displayName = 'Player';

export default Player;
