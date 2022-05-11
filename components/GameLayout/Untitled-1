import { FC, useEffect } from "react";
import Header, { Props as HeaderProps } from "../../components/Header";
import { useRouter } from "next/router";

const GameLayout: FC<
  Pick<
    HeaderProps,
    | "altNav"
    | "showAltNav"
    | "noNav"
    | "palette"
    | "isCardPage"
  >
> = ({
  noNav,
  altNav,
  showAltNav,
  palette,
  children,
  isCardPage,
}) => {
  const {
    query: { scrollIntoView, scrollIntoViewBehavior, ...query },
    replace,
  } = useRouter();

  useEffect(() => {
    if (!scrollIntoView) {
      return;
    }

    const element = document.querySelector(
      scrollIntoView instanceof Array ? scrollIntoView[0] : scrollIntoView
    );

    if (element) {
      replace({ query }, undefined, {
        scroll: false,
        shallow: true,
      });

      return () => {
        element.scrollIntoView({
          behavior:
            scrollIntoViewBehavior === "smooth"
              ? scrollIntoViewBehavior
              : "auto",
          block: "start",
        });
      };
    }
  }, [query, replace, scrollIntoView, scrollIntoViewBehavior]);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
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

    </div>
  );
};

export default GameLayout;
