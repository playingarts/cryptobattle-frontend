import { FC, useEffect, useRef } from "react";
import GameHeader, { Props as HeaderProps } from "../../components/GameHeader";
import ScrollContainer from "react-indiana-drag-scroll";

const GameLayout: FC<
  Pick<
    HeaderProps,
    "altNav" | "showAltNav" | "noNav" | "palette" | "isCardPage" | "loading"
  >
> = ({ palette, loading, children }) => {
  const container = useRef(null);

  useEffect(() => {
    if (container.current) {
      // eslint-disable-next-line
      // @ts-ignore: Unreachable code error
      container.current?.scrollTo(
              // eslint-disable-next-line
      // @ts-ignore: Unreachable code error
         ((container.current.scrollWidth - container.current.clientWidth)   / 2) ,
              // eslint-disable-next-line
      // @ts-ignore: Unreachable code error
        container.current.scrollHeight / 2   - container.current.clientHeight / 2
      );
    }
  }, []);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      {/* // eslint-disable-next-line 
    // @ts-ignore: Unreachable code error */}

      <ScrollContainer
        className="scroll-container"
        ignoreElements=".draggable"
        style={{ width: "100vw", height: "100vh", padding: 90 }}
        innerRef={container}
      >
        <GameHeader
          loading={loading}
          css={(theme) => ({
            position: "fixed",
            left: theme.spacing(1),
            right: theme.spacing(1),
            top: theme.spacing(2),
            zIndex: 10,

            "@media (min-width: 1440px)": {
              maxWidth: theme.spacing(170),
              left: "50%",
              transform: "translate(-50%, 0)",
              width: "100%",
            },
          })}
          palette={palette}
        />

        {children}
      </ScrollContainer>
    </div>
  );
};

export default GameLayout;
