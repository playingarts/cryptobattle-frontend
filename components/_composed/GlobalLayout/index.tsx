import { FC, useEffect } from "react";
import Layout from "../../../components/Layout";
import Header, { Props as HeaderProps } from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useRouter } from "next/router";

const ComposedGlobalLayout: FC<
  Pick<
    HeaderProps,
    | "altNav"
    | "showAltNav"
    | "noNav"
    | "palette"
    | "isCardPage"
    | 'headerTitle'
    | "headerMiddle"
    | "headerRight"

  >
> = ({
  palette,
  children,
  headerTitle,
  headerMiddle,
  headerRight
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
      headerTitle={headerTitle}
      headerMiddle={headerMiddle}
      headerRight={headerRight}
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

      {children}

       <Layout css={(theme) => ({ marginTop: theme.spacing(0) })}>
        <Footer
          css={(theme) => ({
            marginBottom: theme.spacing(1),
            marginLeft: -theme.spacing(9.5),
            marginRight: -theme.spacing(9.5),
            paddingLeft: theme.spacing(9.5),
            paddingRight: theme.spacing(9.5),
            paddingTop: theme.spacing(0),
            paddingBottom: theme.spacing(6),
          })}
        />
      </Layout> 
    </div>
  );
};

export default ComposedGlobalLayout;
