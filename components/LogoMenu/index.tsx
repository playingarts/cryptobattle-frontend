import Link from "../Link";
import Line from "../Line";
import Text from "../Text";

import GameRules from "../GameRules";
import Leaderboard from "../Leaderboard";
import { useWS } from "../WsProvider";

import Discord from "../Icons/Discord";
import Youtube from "../Icons/Youtube";
import Pinterest from "../Icons/Pinterest";
import Button from "../Button";
import Twitter from "../Icons/Twitter";
import { socialLinks } from "../../source/consts";
import Instagram from "../Icons/Instagram";
import Facebook from "../Icons/Facebook";
import Behance from "../Icons/Behance";
import CloseMenu from "../Icons/CloseMenu";
import { FC, HTMLAttributes, useState } from "react";
import { useRouter } from "next/router";
export type Props = HTMLAttributes<HTMLDivElement>;
interface MenuItem extends Props {
  to: string;
  text: string;
  fontSize?: number;
}

const MenuItem: FC<MenuItem> = ({ to, text, fontSize = 22 }) => {
  return (
    <Link href={to} passHref>
      <li
        css={{
          color: "rgba(0, 0, 0)",
          cursor: "pointer",
          paddingBottom: 20,
          transition: "all 300ms",
          listStyle: "none",
          fontSize,
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
  borderRadius: 20,
  // padding: "11px 5px",
  width: 380,
  backgroundColor: "white",
  marginTop: -60,
  minHeight: 500,
  zIndex: 4000
  ,
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
  headerTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const WSProvider = useWS();
  const router = useRouter();
  const purgeGames = () => {
    WSProvider.send(
      JSON.stringify({
        event: "purge-rooms-and-games",
        data: {},
      })
    );
    router.push("/dashboard");

    setTimeout(() => {

      window.location.reload();
    }, 2000);
  };

  return (
    <>
      {/* Hamburger & Logo */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: "10px",
          padding: 4,
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor css={{ padding: "0 20px", background: '#181818', borderRadius: 10 }}>
            <PopoverTrigger asChild>
              <div
                css={{
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                  color: "white",
                  height: "60px",
                  marginTop: "0",
                  width: 340,
                }}
              >
                <div style={{ marginRight: "36px" }} className="hamburger">
                  <span className="line line-1"></span>
                  <span className="line line-2"></span>
                  <span className="line line-3"></span>
                </div>
                {!logo && (
                  <Text
                    component="div"
                    variant="h5"
                    css={{
                      textTransform: "uppercase",
                      paddingTop: 8,
                      cursor: "pointer",
                    }}
                  >
                    {headerTitle ? headerTitle : "CRYPTOBATTLE"}
                  </Text>
                )}
                {logo &&logo}
              </div>
            </PopoverTrigger>
          </PopoverAnchor>
          <PopoverContent>
            <Flex css={{ flexDirection: "column" }}>
              <PopoverClose
                css={{
                  background: "none",
                  border: "none",
                  width: 20,
                  height: 20,
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
                    padding: 8,
                    position: "absolute",
                    top: -49,
                    left: 16,
                    cursor: "pointer",
                    transition: "all 600ms",
                    "&:hover": {
                      transform: `rotateZ(90deg)`,
                    },
                  }}
                >
                  <CloseMenu />
                </div>
              </PopoverClose>
              <div css={{ padding: "0 50px 0 95px" }}>
                <Text
                  component="div"
                  variant="h5"
                  css={{
                    textTransform: "uppercase",
                    paddingTop: 0,
                    cursor: "pointer",
                  }}
                >
                  Playing Arts
                </Text>{" "}
                <ul css={{ fontSize: 22, padding: 0, marginTop: 40 }}>
                  <MenuItem to="/dashboard" text="Dashboard" />

                  <div>
                    <GameRules>
                      <div
                        css={{
                          color: "rgba(0, 0, 0)",
                          cursor: "pointer",
                          paddingBottom: 20,
                          transition: "all 300ms",
                          listStyle: "none",
                          "&:hover": {
                            opacity: "0.6",
                          },
                        }}
                      >
                        Game Rules
                      </div>
                    </GameRules>
                  </div>
                  <Leaderboard>
                    <div
                      css={{
                        color: "rgba(0, 0, 0)",
                        cursor: "pointer",
                        paddingBottom: 20,
                        transition: "all 300ms",
                        listStyle: "none",
                        "&:hover": {
                          opacity: "0.6",
                        },
                      }}
                    >
                      Leaderboard
                    </div>
                  </Leaderboard>

                  <li
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
                    }}
                  >
                    Purge rooms and games
                  </li>

                  <div css={{ paddingBottom: 20 }}>
                    <Line spacing={2}></Line>
                  </div>
                  <MenuItem to="/" text="Buy NFT on Opensea" fontSize={16} />
                  <MenuItem to="/" text="Buy NFT on LooksRare" fontSize={16} />
                </ul>
              </div>
              <nav
                css={(theme) => ({
                  display: "flex",
                  flexWrap: "wrap",
                  marginLeft: 14,
                  color: theme.colors.text_subtitle_light,
                  justifyContent: "start",
                })}
              >
                {[
                  {
                    Icon: Twitter,
                    href: socialLinks.twitter,
                  },
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
                    Icon: Pinterest,
                    href: socialLinks.pinterest,
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
            </Flex>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
