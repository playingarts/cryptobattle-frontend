import { FC, HTMLAttributes, useRef } from "react";
import {  useState } from "react";
import { theme } from "../../pages/_app";
import Image from "next/image";
import Loader from "../Loader";

interface Card {
  img: string;
  video?: string;
  background?: string;
  info?: string;
}

interface Props extends HTMLAttributes<HTMLElement> {
  card: Card;
  animated?: boolean;
  isStatic?: boolean;
  size?: "big";
  interactive?: boolean;
}

const Card: FC<Props> = ({
  card,
  animated,
  isStatic,
  size,
  interactive,
  ...props
}) => {
  const [hovered, setHover] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const width = size === "big" ? 37 : 21;
  const height = size === "big" ? 52 : 29.4;
  const wrapper = useRef<HTMLDivElement>(null);
  const [{ x, y }, setSkew] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);
  const hideLoader = () => setLoaded(true);

  animated = !card.img || (animated && !!card.video);

  // useEffect(() => {
  //   if (animated || !video.current) {
  //     return;
  //   }

  //   // Initializing values
  //   let isPlaying = true;

  //   // On video playing toggle values
  //   video.current.onplaying = function () {
  //     isPlaying = true;
  //   };

  //   // On video pause toggle values
  //   video.current.onpause = function () {
  //     isPlaying = false;
  //   };

  //   // Play video function
  //   async function playVid() {
  //     if (video.current?.paused && !isPlaying) {
  //       return video.current?.play();
  //     }
  //   }

  //   // Pause video function
  //   function pauseVid() {
  //     if (!video.current?.paused && isPlaying) {
  //       video.current?.pause();
  //     }
  //   }

  //   if (!hovered) {
  //     pauseVid();
  //     video.current.currentTime = 0;
  //   } else {
  //     playVid();
  //   }
  // }, [hovered, animated]);

  return (
    <div
      {...props}
      css={(theme) => ({
        "&:hover": {
          color: "rgba(10, 10, 10, 0.7)",
        },
        transition: theme.transitions.fast("color"),
        width: theme.spacing(width),
        textAlign: "center",
        color: theme.colors.text_subtitle_dark,
        fontWeight: 500,
        fontsize: 18,
        lineheight: 21,
        position: "relative",
      })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        css={{
          width: "70px",
          height: "70px",
          background: "#181818",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "100px",
          transition: 'all 400ms',
          cursor: "pointer",
          opacity: 0.5,
          position: "absolute",
          top: "50%",
          left: "50%",
          marginLeft: "-35px",
          marginTop: "-35px",
          zIndex: 55,
          "&:hover": {
            opacity: 1,
          },
        }}
      >
        <svg
          width="31"
          height="31"
          viewBox="0 0 31 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="16"
            y1="1.5"
            x2="16"
            y2="29.5"
            stroke="#8B8C8F"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="29.5"
            y1="16"
            x2="1.5"
            y2="16"
            stroke="#8B8C8F"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div
        {...(interactive && {
          onMouseMove: ({ clientX, clientY }) => {
            if (!wrapper.current) {
              return;
            }

            const { left, width, top, height } =
              wrapper.current.getBoundingClientRect();

            setSkew({
              x: (clientX - left) / width - 0.5,
              y: (clientY - top) / height - 0.5,
            });
          },
        })}
        ref={wrapper}
      >
        <div
          {...props}
          css={(theme) => [
            {
              transition: theme.transitions.fast(["transform", "box-shadow"]),
              overflow: "hidden",
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.25)",
              position: "relative",
              height: theme.spacing(height),
              borderRadius: theme.spacing(1.5),
              background: card.background || theme.colors.text_title_dark,
            },
            hovered &&
              !interactive &&
              !isStatic && {
                transform: `translate(0, -${theme.spacing(0)}px)`,
                boxShadow: "0 20px 10px rgba(0, 0, 0, 0.25)",
              },
          ]}
          style={
            (hovered &&
              interactive && {
                transition: "initial",
                transform: `perspective(${theme.spacing(width)}px) rotateX(${
                  -y * 10
                }deg) rotateY(${x * 10}deg) scale3d(1, 1, 1)`,
              }) ||
            undefined
          }
        >
          {!animated && (
            <div
              style={{
                position: "absolute",
                opacity: loaded ? 1 : 0,
                transition: theme.transitions.slow("opacity"),
                zIndex: hovered ? -1 : 1,
              }}
            >
              <Image
                quality={100}
                width={theme.spacing(width)}
                height={theme.spacing(height)}
                src={card.img}
                alt={card.info}
                css={(theme) => ({ borderRadius: theme.spacing(1.5) })}
                onLoadingComplete={hideLoader}
                unoptimized={true}
              />
            </div>
          )}
          {card.video && (
            <video
              loop
              muted
              playsInline
              ref={video}
              css={(theme) => ({
                opacity: loaded ? 1 : 0,
                transition: theme.transitions.slow("opacity"),
                width: theme.spacing(width),
                height: theme.spacing(height),
              })}
              onLoadedData={hideLoader}
              {...(animated ? { autoPlay: true } : { preload: "none" })}
            >
              <source src={card.video} type="video/mp4" />
            </video>
          )}
          {!loaded && (
            <Loader
              css={(theme) => ({
                color: theme.colors.light_gray,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              })}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
