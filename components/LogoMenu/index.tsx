import Link from "../Link";
import Line from "../Line";
import Text from "../Text";

// import { useWS } from "../WsProvider";
import { useAuth } from "../AuthProvider";

import Discord from "../Icons/Discord";
import Youtube from "../Icons/Youtube";
import Button from "../Button";
import { socialLinks } from "../../source/consts";
import Instagram from "../Icons/Instagram";
import Facebook from "../Icons/Facebook";
import Behance from "../Icons/Behance";
import CloseMenu from "../Icons/CloseMenu";
import { FC, HTMLAttributes, useState } from "react";
// import { useRouter } from "next/router";
export type Props = HTMLAttributes<HTMLDivElement>;
interface MenuItem extends Props {
  to: string;
  text: string;
  fontSize?: number;
  fontWeight?: number;
}

const MenuItem: FC<MenuItem> = ({
  to,
  text,
  fontSize = 22,
  fontWeight = 500,
}) => {
  return (
    <Link href={to} passHref>
      <li
        css={{
          color: "rgba(0, 0, 0, 0.5)",
          cursor: "pointer",
          paddingBottom: 20,
          transition: "all 300ms",
          listStyle: "none",
          fontSize,
          fontWeight,
          "&:hover": {
            opacity: "0.6",
          },
        }}
      >
        {text}
      </li>
    </Link>
  );
};

import { styled } from "@stitches/react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

// const slideUpAndFade = keyframes({
//   "0%": { opacity: 0, transform: "translateY(2px)" },
//   "100%": { opacity: 1, transform: "translateY(0)" },
// });

// const slideRightAndFade = keyframes({
//   "0%": { opacity: 0, transform: "translateX(-2px)" },
//   "100%": { opacity: 1, transform: "translateX(0)" },
// });

// const slideDownAndFade = keyframes({
//   "0%": { opacity: 0, transform: "translateY(-2px)" },
//   "100%": { opacity: 1, transform: "translateY(0)" },
// });

// const slideLeftAndFade = keyframes({
//   "0%": { opacity: 0, transform: "translateX(2px)" },
//   "100%": { opacity: 1, transform: "translateX(0)" },
// });
const StyledContent = styled(PopoverPrimitive.Content, {
  borderRadius: 10,
  // padding: "11px 5px",
  width: 380,
  backgroundColor: "white",
  marginTop: -70,
  marginLeft: -15,
  paddingBottom: 40,
  // minHeight: 550,
  zIndex: 10000000,
  // paddingLeft: 40,
  boxShadow:
    "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
  "@media (prefers-reduced-motion: no-preference)": {
    // animationDuration: "400ms",
    // animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    // animationFillMode: "forwards",
    // willChange: "transform, opacity",
    // '&[data-state="open"]': {
    //   '&[data-side="top"]': { animationName: slideDownAndFade },
    //   '&[data-side="right"]': { animationName: slideLeftAndFade },
    //   '&[data-side="bottom"]': { animationName: slideUpAndFade },
    //   '&[data-side="left"]': { animationName: slideRightAndFade },
    // },
  },
  "&:focus": {
    boxShadow: `rgba(0, 0, 0, 0.35) 0px 5px 15px`,
  },
  "&:focus-visible": {
    boxShadow: `rgba(0, 0, 0, 0.35) 0px 5px 15px`,
    outline: "none",
  },
});

// Exports
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

export const PopoverContent = StyledContent;

// Your app...
const Flex = styled("div", { display: "flex" });

export default function LogoMenu({
  logo,
  headerTitle,
}: {
  logo: any;
  headerTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const { loggedIn, logout, user } = useAuth();

  // const WSProvider = useWS();
  // const router = useRouter();
  // const purgeGames = () => {
  //   WSProvider.send(
  //     JSON.stringify({
  //       event: "purge-rooms-and-games",
  //       data: {},
  //     })
  //   );
  //   router.push("/dashboard");

  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 2000);
  // };

  return (
    <>
      {/* Hamburger & Logo */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: "10px",
          padding: 0,
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor
            css={{
              display: "flex",
              justifyContent: "flex-start",
              width: "390px",
            }}
          >
            <PopoverTrigger asChild>
              <div
                css={{
                  padding: "0 20px",
                  borderRadius: 10,
                  width: "auto",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  color: "white",
                  height: "70px",
                  marginTop: "0",
                  background: "#181818",
                }}
              >
                <div className="hamburger">
                  <span className="line line-1"></span>
                  <span className="line line-2"></span>
                  <span className="line line-3"></span>
                </div>
                {!logo && headerTitle && (
                  <Text
                    component="div"
                    variant="h5"
                    css={{
                      color: "#7a7a7a",
                      fontSize: 25,
                      fontWeight: 400,
                      lineHeight: 1.2,
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "color 500ms",
                      "&:hover": {
                        color: "#fff",
                      },
                    }}
                  >
                    {headerTitle}
                  </Text>
                )}
                {logo && logo}
              </div>
            </PopoverTrigger>
          </PopoverAnchor>
          <PopoverContent>
            <Flex css={{ flexDirection: "column" }}>
              <PopoverClose
                css={{
                  background: "none",
                  border: "none",
                  width: 0,
                  height: 10,
                  margin: "5px 5px 5px 4px",
                  "&:focus": {
                    outline: `none`,
                  },
                }}
                aria-label="Close"
              >
                <div
                  aria-label="Close"
                  css={{
                    margin: 0,
                    padding: 0,
                    cursor: "pointer",
                    transition: "all 300ms",
                    position: "absolute",
                    "&:hover": {
                      transform: `rotateZ(90deg)`,
                    },
                  }}
                >
                  <CloseMenu />
                </div>
              </PopoverClose>
              <div css={{ padding: "0 52px 0 95px" }}>
                <Text
                  component="div"
                  variant="h5"
                  css={{
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Card Battle
                </Text>{" "}
                <ul
                  css={{
                    fontSize: 22,
                    padding: 0,
                    marginTop: 50,
                    marginBottom: 0,
                  }}
                >
                  {/* {loggedIn && <MenuItem fontWeight={400} to="/" text="Home" />} */}
                  {loggedIn && (
                    <MenuItem
                      fontWeight={400}
                      to="/"
                      text="Dashboard"
                    />
                  )}



                  {/* <li
                    onClick={purgeGames}
                    css={{
                      color: "red",
                      cursor: "pointer",
                      paddingBottom: 0,
                      transition: "all 300ms",
                      listStyle: "none",
                      "&:hover": {
                        opacity: "0.6",
                      },
                      marginBottom: 20,
                    }}
                  >
                    Purge rooms and games
                  </li> */}

                  {!loggedIn && (
                    <div
                      css={{
                        paddingBottom: 0,
                        color: "#666",
                        lineHeight: "130%",
                      }}
                    >
                      Go head to head with opponents in turn-based card battle
                    </div>
                  )}

                  {!loggedIn && <Line spacing={3}></Line>}

                  {/* 

                  {loggedIn && (
                    <MenuItem
                      to="https://opensea.io/collection/cryptoedition"
                      text="Buy NFT on Opensea"
                      fontSize={16}
                    />
                  )} */}

                  {/* <MenuItem to="/" text="Buy NFT on LooksRare" fontSize={16} /> */}

                  {loggedIn && !user?.isGuest && (
                    <li
                      onClick={logout}
                      css={{
                        cursor: "pointer",
                        color: "rgba(0, 0, 0, 0.5)",
                        paddingBottom: 0,
                        marginBottom: 0,
                        fontWeight: 400,
                        transition: "all 300ms",
                        listStyle: "none",
                        "&:hover": {
                          opacity: "0.6",
                        },
                      }}
                    >
                      Log out
                    </li>
                  )}
                </ul>
              </div>
              {!loggedIn && (
                <nav
                  css={(theme) => ({
                    display: "flex",
                    flexWrap: "wrap",
                    marginLeft: "auto",
                    marginRight: "auto",
                    color: theme.colors.text_subtitle_light,
                    justifyContent: "start",
                  })}
                >
                  {[
                    {
                      Icon: Instagram,
                      href: socialLinks.instagram,
                    },
                    {
                      Icon: Facebook,
                      href: socialLinks.facebook,
                    },
                    {
                      Icon: Behance,
                      href: socialLinks.behance,
                    },
                    {
                      Icon: Youtube,
                      href: socialLinks.youtube,
                    },
                    {
                      Icon: Discord,
                      href: socialLinks.discord,
                    },
                  ].map(({ Icon, href }) => (
                    <Button
                      key={href}
                      component={Link}
                      target="_blank"
                      href={href}
                      css={{
                        color: "#181818",
                        transition: "all 400ms",
                        "&:hover": {
                          transform: `scale(1.1)`,
                        },
                      }}
                      Icon={Icon}
                    />
                  ))}
                </nav>
              )}
            </Flex>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
