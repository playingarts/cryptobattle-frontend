import { FC, HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLElement> {
  animated?: boolean;
  isStatic?: boolean;
  selectedCard?: any;
  size?: "big";
  interactive?: boolean;
  noInfo?: boolean;
  isPlaceholder?: boolean;
  containerStyles?: any;
}

const Card: FC<Props> = ({
  size,
  isPlaceholder = false,
  containerStyles,
  ...props
}) => {
  const width = size === "big" ? 37 : 21;
  const height = size === "big" ? 52 : 29.4;

  return (
    <div
      {...props}
      className="dropzone"
      css={(theme) => ({
        transition: theme.transitions.fast("color"),
        width: theme.spacing(width),
        textAlign: "center",
        color: theme.colors.text_subtitle_dark,
        fontWeight: 500,
        fontsize: 18,
        lineheight: 21,
      })}
    >
      <div>
        <div
          css={(theme) => [
            {
              overflow: "hidden",
              position: "relative",
              height: theme.spacing(height),
              borderRadius: theme.spacing(1.5),
              border: 0,
              background: isPlaceholder ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.1)",
              transition: 'all 400ms',
              ...containerStyles
            },
          ]}
        >
        </div>
      </div>
    </div>
  );
};

export default Card;
