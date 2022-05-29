import { FC, useEffect, useRef } from "react";
import GameHeader, { Props as HeaderProps } from "../../components/GameHeader";
import ScrollContainer from "react-indiana-drag-scroll";

const GameLayout: FC<
  Pick<
    HeaderProps,
    "altNav" | "showAltNav" | "noNav" | "palette" | "isCardPage"
  >
> = ({ palette, children }) => {
  const container = useRef(null);
  // const dragHandlers = {onStart: this.onStart, onStop: this.onStop};




  useEffect(() => {
    if (container.current) {
    // eslint-disable-next-line 
    // @ts-ignore: Unreachable code error
      container.current?.scrollTo(0, 480);
    }
  }, []);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", cursor: "move"}}>
          {/* // eslint-disable-next-line 
    // @ts-ignore: Unreachable code error */}
      <ScrollContainer
        className="scroll-container"
        style={{ width: "100vw", height: "100vh" }}
        innerRef={container}

      >
        <GameHeader
          css={(theme) => ({
            position: "fixed",
            left: theme.spacing(1),
            right: theme.spacing(1),
            top: theme.spacing(1),
            zIndex: 10,

            "@media (min-width: 1440px)": {
              maxWidth: theme.spacing(142),
              left: "50%",
              transform: "translate(-50%, 0)",
              width: "100%",
            },
          })}
 
          palette={palette}
        />
        {/* <Draggable >
          <div className="box">I can be dragged anywhere</div>
        </Draggable> */}
        {children}
      </ScrollContainer>
    </div>
  );
};

export default GameLayout;
