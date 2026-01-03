import { forwardRef, useState, useEffect, useRef, useCallback } from "react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { useGame } from "../GameProvider";

// Fixed display duration for all players (30 seconds)
const DISPLAY_DURATION_MS = 30000;
const SCORE_ANIMATION_DURATION = 400; // ms for score count animation

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

    // Use optimistic points (calculated instantly on card drop) if available,
    // otherwise fall back to server-confirmed points.
    // When optimisticPoints exists, use it for ALL players (including opponents whose points may decrease).
    // If a player isn't in optimisticPoints, they have 0 (all their cells were stolen).
    const targetPoints = state.optimisticPoints !== null
      ? (state.optimisticPoints[player.userId] ?? 0)
      : (state.serverState?.playersCurrentPoints?.[player.userId] ?? player.points ?? 0)

    // Animated score state
    const [displayedPoints, setDisplayedPoints] = useState(targetPoints)
    const [isAnimating, setIsAnimating] = useState(false)
    const [scoreDirection, setScoreDirection] = useState<'up' | 'down' | null>(null)
    const scoreAnimationRef = useRef<number | null>(null)
    const prevTargetRef = useRef(targetPoints)

    // Animate score changes
    useEffect(() => {
      if (targetPoints === prevTargetRef.current) return

      const startValue = prevTargetRef.current
      const endValue = targetPoints
      const startTime = Date.now()
      const direction = endValue > startValue ? 'up' : 'down'

      setIsAnimating(true)
      setScoreDirection(direction)
      prevTargetRef.current = targetPoints

      const animateScore = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / SCORE_ANIMATION_DURATION, 1)
        // Ease out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3)
        const currentValue = Math.round(startValue + (endValue - startValue) * eased)

        setDisplayedPoints(currentValue)

        if (progress < 1) {
          scoreAnimationRef.current = requestAnimationFrame(animateScore)
        } else {
          setDisplayedPoints(endValue)
          // Keep the animation state briefly for the bounce to complete
          setTimeout(() => {
            setIsAnimating(false)
            setScoreDirection(null)
          }, 150)
        }
      }

      scoreAnimationRef.current = requestAnimationFrame(animateScore)

      return () => {
        if (scoreAnimationRef.current) {
          cancelAnimationFrame(scoreAnimationRef.current)
        }
      }
    }, [targetPoints])

    // Track when current player changes (new turn starts)
    const prevCurrentPlayerRef = useRef<string | null>(null)

    // Check if this player has made a move (animation is pending for their card)
    const animationForThisPlayer = state.pendingAnimation?.playerId === player.userId

    // Track when move was made for smooth reset animation
    const moveStartTimeRef = useRef<number | null>(null)
    const progressAtMoveRef = useRef<number>(100)
    const RESET_DURATION = 300 // ms to animate back to 100%

    // Once a move is detected, remember it for this turn
    if (animationForThisPlayer && !moveMadeThisTurnRef.current) {
      moveMadeThisTurnRef.current = true
      moveStartTimeRef.current = Date.now()
      progressAtMoveRef.current = progress
    }

    // Animation loop using requestAnimationFrame for smooth 60fps
    const animate = useCallback(() => {
      // If move was made, animate back to 100%
      if (moveMadeThisTurnRef.current && moveStartTimeRef.current !== null) {
        const elapsed = Date.now() - moveStartTimeRef.current
        const resetProgress = Math.min(elapsed / RESET_DURATION, 1)
        // Ease out
        const eased = 1 - Math.pow(1 - resetProgress, 2)
        const newProgress = progressAtMoveRef.current + (100 - progressAtMoveRef.current) * eased

        setProgress(newProgress)

        if (resetProgress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        }
        return
      }

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

      // If this player made a move this turn, animate back to 100%
      if (moveMadeThisTurnRef.current && isMyTurn) {
        // Start reset animation
        rafRef.current = requestAnimationFrame(animate)
        prevCurrentPlayerRef.current = currentPlayerId
        return
      }

      // If it's not this player's turn, reset to 100% and clear move flag
      if (!isMyTurn) {
        setProgress(100)
        turnStartTimeRef.current = null
        moveMadeThisTurnRef.current = false
        moveStartTimeRef.current = null
        prevCurrentPlayerRef.current = currentPlayerId
        return
      }

      // It's this player's turn - start/continue countdown
      if (turnChanged) {
        // New turn started - reset timer and clear move flag
        turnStartTimeRef.current = Date.now()
        moveMadeThisTurnRef.current = false
        moveStartTimeRef.current = null
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
      <div css={{marginRight: 20}} ref={ref}>
        <CircularProgressbarWithChildren
          styles={{
            // Customize the root svg element
            root: {},
            // Customize the path, i.e. the "completed progress"
            path: {
              // Path color
              stroke: inactive ? '#3a3a3a' : player.color,
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
              // Trail color - transparent to remove black border
              stroke: "none",
              strokeWidth: 0,
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
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9999,
              width: 62,
              height: 62,
              background: inactive ? '#2a2a2a' : '#1A1A1A',
              filter: inactive ? 'grayscale(100%)' : 'none',
              opacity: loadingDelayed ? "0" : "1",
              transform: loadingDelayed
                ? "translate(1500px, 0)"
                : "translate(0, 0)",
            }}
          >
            <div
              css={{
                fontSize: 32,
                color: "#fff",
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              {displayedPoints}
            </div>
          </div>
        </CircularProgressbarWithChildren>
      </div>
    );
  }
);

Player.displayName = 'Player';

export default Player;
