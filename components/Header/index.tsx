import { FC, HTMLAttributes } from "react";
import LogoIcon from "../Icons/Logo";

import Link from "../Link";
import LogoMenu from "../LogoMenu";

export interface Props extends HTMLAttributes<HTMLElement> {
  palette?: "gradient";
  altNav?: JSX.Element;
  showAltNav?: boolean;
  noNav?: boolean;
  isCardPage?: boolean;
  headerTitle?: any;
  headerMiddle?: any;
  headerRight?: any;
}

const Header: FC<Props> = ({
  palette,
  headerTitle,
  headerMiddle,
  headerRight,
  ...props
}) => {
  return (
    <header {...props}>
      <div
        css={(theme) => [
          {
            borderRadius: theme.spacing(1),
            display: "flex",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
            height: 70,
            marginTop: 0,
            // padding: 5,
            overflow: "hidden",
          },

          palette === "gradient"
            ? {
                background: theme.colors.gradient,
              }
            : {
                background: "#181818",
                color: theme.colors.text_subtitle_light,
              },
        ]}
      >
        <div
          css={{
            flexGrow: 1,
            position: "relative",
            marginTop: "0px",
            fontSize: "30px",
          }}
        >
          <LogoMenu headerTitle={headerTitle} logo={null}></LogoMenu>
        </div>

        <div
          css={(theme) => ({
            transition: theme.transitions.normal("top"),
            textAlign: "center",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          })}
        >
          {headerMiddle ? (
            headerMiddle
          ) : (
            <Link href="/">
              <LogoIcon
                css={(theme) => [
                  palette !== "gradient" && {
                    color: theme.colors.text_subtitle_light,
                  },
                  {
                    transition: "opacity 500ms",

                    "&:hover": {
                      opacity: "0.6",
                    },
                  },
                ]}
              />
            </Link>
          )}
        </div>

        {headerRight && headerRight}
      </div>
    </header>
  );
};

export default Header;
