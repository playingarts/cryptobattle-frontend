import { FC, useEffect, useRef } from "react";
import Header, { Props as HeaderProps } from "../../components/Header";
import ScrollContainer from "react-indiana-drag-scroll";

const GameLayout: FC<
  Pick<
    HeaderProps,
    "altNav" | "showAltNav" | "noNav" | "palette" | "isCardPage"
  >
> = ({ noNav, altNav, showAltNav, palette, children, isCardPage }) => {
  const container = useRef(null);

  useEffect(() => {
    if (container.current) {
    // eslint-disable-next-line 
    // @ts-ignore: Unreachable code error
      container.current?.scrollTo(0, 480);
    }
  }, []);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", cursor: "move"}}>
      <ScrollContainer
        className="scroll-container"
        style={{ width: "100vw", height: "100vh" }}
        innerRef={container}

      >
        <Header
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
          altNav={altNav}
          showAltNav={showAltNav}
          noNav={noNav}
          palette={palette}
          isCardPage={isCardPage}
        />

        {children}
      </ScrollContainer>
    </div>
  );
};

export default GameLayout;
