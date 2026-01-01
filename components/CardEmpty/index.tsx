import { FC, HTMLAttributes, useRef } from "react";

// Error X icon as base64 SVG
const ERROR_ICON_SVG = "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzIxMTZfMjU1MCkiPgo8cGF0aCBkPSJNMjUgMEMyMC4wNTU1IDAgMTUuMjIyIDEuNDY2MjIgMTEuMTEwOCA0LjIxMzI2QzYuOTk5NTMgNi45NjAyOSAzLjc5NTIxIDEwLjg2NDggMS45MDMwMiAxNS40MzI5QzAuMDEwODMyMiAyMC4wMDExIC0wLjQ4NDI1MSAyNS4wMjc3IDAuNDgwMzc5IDI5Ljg3NzNDMS40NDUwMSAzNC43MjY4IDMuODI2MDMgMzkuMTgxNCA3LjMyMjM0IDQyLjY3NzdDMTAuODE4NyA0Ni4xNzQgMTUuMjczMiA0OC41NTUgMjAuMTIyOCA0OS41MTk2QzI0Ljk3MjMgNTAuNDg0MyAyOS45OTg5IDQ5Ljk4OTIgMzQuNTY3MSA0OC4wOTdDMzkuMTM1MyA0Ni4yMDQ4IDQzLjAzOTcgNDMuMDAwNSA0NS43ODY3IDM4Ljg4OTNDNDguNTMzOCAzNC43NzggNTAgMjkuOTQ0NSA1MCAyNUM0OS45OTI4IDE4LjM3MTggNDcuMzU2NiAxMi4wMTcxIDQyLjY2OTggNy4zMzAyNUMzNy45ODI5IDIuNjQzMzkgMzEuNjI4MiAwLjAwNzE2ODkyIDI1IDBWMFpNMjUgNDUuODMzM0MyMC44Nzk2IDQ1LjgzMzMgMTYuODUxNyA0NC42MTE1IDEzLjQyNTYgNDIuMzIyM0M5Ljk5OTYxIDQwLjAzMzEgNy4zMjkzNSAzNi43Nzk0IDUuNzUyNTIgMzIuOTcyNkM0LjE3NTcgMjkuMTY1OCAzLjc2MzEzIDI0Ljk3NjkgNC41NjY5OCAyMC45MzU2QzUuMzcwODQgMTYuODk0MyA3LjM1NTAzIDEzLjE4MjIgMTAuMjY4NiAxMC4yNjg2QzEzLjE4MjIgNy4zNTUwMSAxNi44OTQ0IDUuMzcwODMgMjAuOTM1NiA0LjU2Njk3QzI0Ljk3NjkgMy43NjMxMSAyOS4xNjU4IDQuMTc1NjggMzIuOTcyNiA1Ljc1MjUxQzM2Ljc3OTQgNy4zMjkzNCA0MC4wMzMxIDkuOTk5NiA0Mi4zMjIzIDEzLjQyNTZDNDQuNjExNSAxNi44NTE2IDQ1LjgzMzMgMjAuODc5NiA0NS44MzMzIDI1QzQ1LjgyNzMgMzAuNTIzNSA0My42MzA0IDM1LjgxOSAzOS43MjQ3IDM5LjcyNDdDMzUuODE5IDQzLjYzMDQgMzAuNTIzNSA0NS44MjczIDI1IDQ1LjgzMzNaIiBmaWxsPSIjRkU1NjIxIi8+CjxwYXRoIGQ9Ik0zNC44MDYxIDE1LjE5MzhDMzQuNDE1NSAxNC44MDMyIDMzLjg4NTYgMTQuNTgzOCAzMy4zMzMyIDE0LjU4MzhDMzIuNzgwOCAxNC41ODM4IDMyLjI1MSAxNC44MDMyIDMxLjg2MDMgMTUuMTkzOEwyNC45OTk5IDIyLjA1NDJMMTguMTM5NSAxNS4xOTM4QzE3Ljk0NzMgMTQuOTk0OCAxNy43MTc0IDE0LjgzNjEgMTcuNDYzMiAxNC43MjY5QzE3LjIwOTEgMTQuNjE3NyAxNi45MzU3IDE0LjU2MDIgMTYuNjU5MSAxNC41NTc4QzE2LjM4MjQgMTQuNTU1NCAxNi4xMDgxIDE0LjYwODEgMTUuODUyMSAxNC43MTI5QzE1LjU5NiAxNC44MTc2IDE1LjM2MzQgMTQuOTcyMyAxNS4xNjc4IDE1LjE2NzlDMTQuOTcyMiAxNS4zNjM1IDE0LjgxNzUgMTUuNTk2MiAxNC43MTI4IDE1Ljg1MjJDMTQuNjA4IDE2LjEwODIgMTQuNTU1MyAxNi4zODI2IDE0LjU1NzcgMTYuNjU5MkMxNC41NjAxIDE2LjkzNTggMTQuNjE3NiAxNy4yMDkyIDE0LjcyNjggMTcuNDYzM0MxNC44MzU5IDE3LjcxNzUgMTQuOTk0NyAxNy45NDc0IDE1LjE5MzYgMTguMTM5NkwyMi4wNTQxIDI1TDE1LjE5MzYgMzEuODYwNEMxNC45OTQ3IDMyLjA1MjYgMTQuODM1OSAzMi4yODI1IDE0LjcyNjggMzIuNTM2N0MxNC42MTc2IDMyLjc5MDggMTQuNTYwMSAzMy4wNjQyIDE0LjU1NzcgMzMuMzQwOEMxNC41NTUzIDMzLjYxNzUgMTQuNjA4IDMzLjg5MTggMTQuNzEyOCAzNC4xNDc4QzE0LjgxNzUgMzQuNDAzOSAxNC45NzIyIDM0LjYzNjUgMTUuMTY3OCAzNC44MzIxQzE1LjM2MzQgMzUuMDI3NyAxNS41OTYgMzUuMTgyNCAxNS44NTIxIDM1LjI4NzFDMTYuMTA4MSAzNS4zOTE5IDE2LjM4MjQgMzUuNDQ0NiAxNi42NTkxIDM1LjQ0MjJDMTYuOTM1NyAzNS40Mzk4IDE3LjIwOTEgMzUuMzgyMyAxNy40NjMyIDM1LjI3MzFDMTcuNzE3NCAzNS4xNjM5IDE3Ljk0NzMgMzUuMDA1MiAxOC4xMzk1IDM0LjgwNjNMMjQuOTk5OSAyNy45NDU4TDMxLjg2MDMgMzQuODA2M0MzMi4yNTMyIDM1LjE4NTggMzIuNzc5NSAzNS4zOTU3IDMzLjMyNTcgMzUuMzkxQzMzLjg3MiAzNS4zODYyIDM0LjM5NDUgMzUuMTY3MSAzNC43ODA4IDM0Ljc4MDlDMzUuMTY3IDM0LjM5NDYgMzUuMzg2MSAzMy44NzIxIDM1LjM5MDkgMzMuMzI1OEMzNS4zOTU2IDMyLjc3OTYgMzUuMTg1NiAzMi4yNTMzIDM0LjgwNjEgMzEuODYwNEwyNy45NDU3IDI1TDM0LjgwNjEgMTguMTM5NkMzNS4xOTY3IDE3Ljc0ODkgMzUuNDE2MSAxNy4yMTkxIDM1LjQxNjEgMTYuNjY2N0MzNS40MTYxIDE2LjExNDIgMzUuMTk2NyAxNS41ODQ0IDM0LjgwNjEgMTUuMTkzOFoiIGZpbGw9IiNGRTU2MjEiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8yMTE2XzI1NTAiPgo8cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==)";

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
  containerStyles,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isPlaceholder,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedCard,
  onClick,
  ...props
}) => {
  const width = size === "big" ? 37 : 21;
  const height = size === "big" ? 52 : 29.4;
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle click with scroll-to-center
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      {...props}
      ref={cardRef}
      onClick={handleClick}
      className="dropzone"
      css={(theme) => ({
        transition: theme.transitions.fast("color"),
        width: theme.spacing(width),
        textAlign: "center",
        color: theme.colors.text_subtitle_dark,
        fontWeight: 500,
        fontsize: 18,
        lineheight: 21,
        // When this dropzone has drop-target class (valid placement), show player color outline
        '&.drop-target:not(.drop-error) > div > div': {
          boxShadow: '0 0 0 3px #7B61FF',
        },
        // When this dropzone has drop-error class (invalid placement), show error styling
        '&.drop-error > div > div::before': {
          opacity: 1,
        },
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
              background: "rgba(0, 0, 0, 0.2)",
              transition: 'background 150ms ease-out, box-shadow 150ms ease-out',
              boxShadow: '0 0 0 0px transparent',
              ...containerStyles,
              // Always render the ::before element but invisible, so we can animate it
              '&::before': {
                content: `' '`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: ERROR_ICON_SVG,
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                borderRadius: 15,
                zIndex: 99999,
                opacity: 0,
                transition: 'all 150ms ease-out',
              },
              // Respond to drop-error class on ancestor (added by interact.js during drag)
              '.drop-error &::before': {
                opacity: 1,
              },
            },
          ]}
        >
        </div>
      </div>
    </div>
  );
};

export default Card;
