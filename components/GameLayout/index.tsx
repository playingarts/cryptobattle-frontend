import { FC, useEffect, useRef } from "react";
import GameHeader, { Props as HeaderProps } from "../../components/GameHeader";
import ScrollContainer from "react-indiana-drag-scroll";
import GameRules from "../../components/GameRules/";

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
        hideScrollbars={false}
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

      <GameRules>
          <div
            css={{
              position: "fixed",
              bottom: 40,
              left: 40,
              height: 60,
              width: 60,
              borderRadius: 4000,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "300ms all",
              background: "#181818",
              cursor: "pointer",
              color: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                color: "#fff",
              },
            }}
          >
            <svg
              width="16"
              height="25"
              viewBox="0 0 16 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.13208 13.105C5.13208 12.6259 5.17943 12.1982 5.27414 11.8218C5.38069 11.4455 5.53459 11.109 5.73585 10.8125C5.93711 10.5159 6.19756 10.2479 6.5172 10.0084C6.84869 9.75745 7.23344 9.52934 7.67148 9.32404L12.3596 7.15128V3.50721H3.6404V6.67225H0V3.50721C0 3.02817 0.0947096 2.57765 0.284129 2.15565C0.473548 1.72224 0.733999 1.35156 1.06548 1.04361C1.39697 0.724252 1.78172 0.47333 2.21976 0.290841C2.66963 0.0969472 3.14317 0 3.6404 0H12.3596C12.8568 0 13.3245 0.0969472 13.7625 0.290841C14.2124 0.47333 14.603 0.724252 14.9345 1.04361C15.266 1.35156 15.5265 1.72224 15.7159 2.15565C15.9053 2.57765 16 3.02817 16 3.50721V6.51827C16 6.9973 15.9526 7.42501 15.8579 7.80139C15.7632 8.17778 15.6152 8.51994 15.414 8.82789C15.2127 9.12444 14.9464 9.39247 14.6149 9.63198C14.2952 9.8715 13.9105 10.0996 13.4606 10.3163L8.75472 12.472V15.4317H5.13208V13.105ZM4.404 19.4179H9.71365V24.5333H4.404V19.4179Z"
                fill="currentColor"
                fillOpacity="1"
              />
            </svg>
          </div>
        </GameRules>
    </div>
  );
};

export default GameLayout;
