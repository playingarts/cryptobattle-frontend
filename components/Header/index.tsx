import { FC, HTMLAttributes} from "react";
import LogoIcon from "../Icons/Logo";

import { useAuth } from "../AuthProvider";
import Button from "../Button";
import Link from "../Link";
import LogoMenu from "../LogoMenu";
import NavProfile from "../NavProfile";

export interface Props extends HTMLAttributes<HTMLElement> {
  palette?: "gradient";
  altNav?: JSX.Element;
  showAltNav?: boolean;
  noNav?: boolean;
  isCardPage?: boolean;
}

const Header: FC<Props> = ({
  palette,

  ...props
}) => {
  // const { deck } = useDeck({ variables: { slug: deckId } });

  // const [expanded, setExpanded] = useState(true);
  // const [hovered, setHovered] = useState(false);
  // const mouseEnter = () => setHovered(true);
  // const mouseLeave = () => setHovered(false);

  const { loggedIn, user } = useAuth();

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
            overflow: "hidden",
          },
          palette === "gradient"
            ? {
                background: theme.colors.gradient,
              }
            : {
                background: "transparent",
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
          <LogoMenu></LogoMenu>
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
          <Link href="/">
            <LogoIcon
              css={(theme) => [
                palette !== "gradient" && {
                  color: theme.colors.text_subtitle_light,
                },
                {
                  transition: 'opacity 500ms',

                "&:hover": {
                  opacity: "0.6",
                }}
              ]}
            />
          </Link>
        </div>

        {/* {altNav && (
          <div
            css={(theme) => ({
              transition: theme.transitions.normal("top"),
              textAlign: "center",
              position: "absolute",
              left: "50%",
              top: (showAltNav && !expanded && "50%") || "150%",
              transform: "translate(-50%, -50%)",
            })}
            onClick={mouseEnter}
          >
            {altNav}
          </div>
        )} */}

        {loggedIn && (
          <Button
            style={{
              marginRight: "15px",
              background: "#7B61FF",
              color: "#fff",
            }}
            component={Link}
            href="/new"
          >
            New Game
          </Button>
        )}



        {loggedIn && user && <NavProfile />}


      </div>
    </header>
  );
};

export default Header;
