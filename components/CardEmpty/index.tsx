import { FC, HTMLAttributes, useRef } from "react";
import { useState} from "react";
import { theme } from "../../pages/_app";

interface Props extends HTMLAttributes<HTMLElement> {
  animated?: boolean;
  isStatic?: boolean;
  selectedCard?: any;
  size?: "big";
  interactive?: boolean;
  noInfo?: boolean;
  isPlaceholder?: boolean;
}

const Card: FC<Props> = ({
  isStatic,
  size,
  selectedCard,
  isPlaceholder = false,
  interactive,
  ...props
}) => {
  const [hovered, setHover] = useState(false);
  const width = size === "big" ? 37 : 21;
  const height = size === "big" ? 52 : 29.4;
  const wrapper = useRef<HTMLDivElement>(null);

  return (
    <div
      {...props}
      className="dropzone"
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
              border: isPlaceholder ? "0" : "3px dashed #333",
              background: isPlaceholder ? "#111" : "transparent",
              transition: 'all 400ms',
              "&:hover": {
              border: isPlaceholder ? "0" : "3px dashed #444",
                ".plus-icon": {
                  color: '#7B61FF'
                }
              }
            },
            hovered &&
              !interactive &&
              !isStatic && {
                transform: `translate(0, -${theme.spacing(0)}px)`,
                boxShadow: "0 20px 10px rgba(0, 0, 0, 0.25)",
              },
          ]}
        >
          <div
            style={{
              position: "absolute",
              opacity: 1,
              transition: theme.transitions.slow("opacity"),
              zIndex: hovered ? -1 : 1,
              display: "flex",
              justifyContent: "center",
              height: "100%",
              width: "100%",
              alignItems: "center",
            }}
          >

          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
