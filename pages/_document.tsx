import { Fragment } from "react";
import { Html, Head, Main, NextScript } from "next/document";
import { Global } from "@emotion/react";
import { theme } from "./_app";

export const Links = () => (
  <Fragment>
    <Global
      styles={{
        h1: theme.typography.h1,
        h2: theme.typography.h2,
        h3: theme.typography.h3,
        h4: theme.typography.h4,
        h5: theme.typography.h5,
        h6: theme.typography.h6,
        body: {
          background: "#1A1A1A",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        svg: {
          verticalAlign: "top",
        },
        button: {
          cursor: "pointer",
        },
        input: {
          color: "inherit",
          background: "none",
          border: 0,
        },
      }}
    />
    <meta name="theme-color" content="#fff" />
  </Fragment>
);

const Document = () => (
  <Html style={{ height: "100%" }} lang="en">
    <Head>
      <Links />
    </Head>

    <body style={{ height: "100%" }}>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
