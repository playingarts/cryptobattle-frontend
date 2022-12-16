import { FC, HTMLAttributes, useRef } from "react";
import { useState } from "react";
import { theme } from "../../pages/_app";

interface Props extends HTMLAttributes<HTMLElement> {
  animated?: boolean;
  isStatic?: boolean;
  size?: "big";
  noInfo?: boolean;
  isNftChoose?: boolean;
}

const CardEmpty: FC<Props> = ({ size, isNftChoose = true, ...props }) => {
  const [hovered, setHover] = useState(false);
  const width = size === "big" ? 37 : 21;
  const height = size === "big" ? 52 : 29.4;
  const wrapper = useRef<HTMLDivElement>(null);

  return (
    <div
      {...props}
      css={(theme) => ({
        "&:hover": {
          color: "rgba(10, 10, 10, 0.7)",
        },
        transform: "scale(0.9,0.9)",
        transformOrigin: "0 0",
        transition: theme.transitions.fast("color"),
        width: theme.spacing(width),
        textAlign: "center",
        color: theme.colors.text_subtitle_dark,
        fontWeight: 500,
        fontsize: 18,
        cursor: "pointer",
        lineheight: hovered ? 21 : 21,
      })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div ref={wrapper}>
        <div
          css={(theme) => [
            {
              overflow: "hidden",
              position: "relative",
              height: theme.spacing(height),
              borderRadius: theme.spacing(1.5),
              background: "rgba(255, 255, 255, 0.05)",
              transition: "all 400ms",
            },
          ]}
        >
          <div
            style={{
              position: "absolute",
              opacity: 1,
              transition: theme.transitions.slow("opacity"),
              display: "flex",
              justifyContent: "center",
              height: "100%",
              width: "100%",
              alignItems: "center",
            }}
          >
            {isNftChoose && (
              <div
                className="plus-icon"
                css={{
                  width: "70px",
                  height: "70px",
                  display: "flex",
                  background: "#181818",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "100px",
                  cursor: "pointer",
                  opacity: 0.6,
                  transition: "all 400ms",
                  color: "#8B8C8F",

                  "&:hover": {
                    color: "#7B61FF",
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
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="29.5"
                    y1="16"
                    x2="1.5"
                    y2="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardEmpty;
