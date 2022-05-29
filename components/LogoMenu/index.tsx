import Link from "../Link";
import Line from "../Line";
import GameRules from "../GameRules";
import Leaderboard from "../Leaderboard";

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

export type Props = HTMLAttributes<HTMLDivElement>;
interface MenuItem extends Props {
  to: string;
  text: string;
  fontSize?: number;
}

const MenuItem: FC<MenuItem> = ({ to, text, fontSize = 22}) => {
  return (
    <Link  href={to} passHref>
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
import Playingarts from "../Icons/Playingarts";

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
  padding: "11px 5px",
  width: 380,
  backgroundColor: "white",
  marginTop: -70,
  marginLeft: 18,
  minHeight: 500,
  zIndex: 4000,

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

export default function LogoMenu({logo}: {logo: any}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Hamburger & Logo */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: "10px",
          padding: "20px",
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div style={{ marginRight: "10px" }} className="hamburger">
              <span className="line line-1"></span>
              <span className="line line-2"></span>
              <span className="line line-3"></span>
            </div>
          </PopoverTrigger>
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
                    top: -52,
                    left: 43,
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
              <div css={{ padding: "0 60px 0 95px" }}>
                <Playingarts />
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
                  <div css={{ paddingBottom: 20 }}>
                    <Line spacing={2}></Line>
                  </div>
                  <MenuItem
                    to="/"
                    text="Buy NFT on Opensea"
                    fontSize={16}
                  />
                  <MenuItem
                    to="/"
                    text="Buy NFT on LooksRare"
                    fontSize={16}
                  />
                </ul>
              </div>
              <nav
                css={(theme) => ({
                  display: "flex",
                  flexWrap: "wrap",
                  gridColumn: "span 6",
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
          <PopoverAnchor>

            {!logo &&  <Link href="/" aria-label="Cruip" passHref>
              <svg
                width="192"
                height="70"
                viewBox="0 0 192 70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.06641 30.1978C2.06641 29.8833 2.1263 29.5876 2.24609 29.3105C2.36589 29.026 2.5306 28.7827 2.74023 28.5806C2.94987 28.3709 3.1932 28.2062 3.47021 28.0864C3.75472 27.9591 4.0542 27.8955 4.36865 27.8955H13.106C13.4204 27.8955 13.7161 27.9591 13.9932 28.0864C14.2777 28.2062 14.5247 28.3709 14.7344 28.5806C14.944 28.7827 15.1087 29.026 15.2285 29.3105C15.3483 29.5876 15.4082 29.8833 15.4082 30.1978V32.2754H13.106V30.1978H4.36865V41.6978H13.106V39.6313H15.4082V41.6978C15.4082 42.0122 15.3483 42.3117 15.2285 42.5962C15.1087 42.8732 14.944 43.1165 14.7344 43.3262C14.5247 43.5358 14.2777 43.7005 13.9932 43.8203C13.7161 43.9401 13.4204 44 13.106 44H4.36865C4.0542 44 3.75472 43.9401 3.47021 43.8203C3.1932 43.7005 2.94987 43.5358 2.74023 43.3262C2.5306 43.1165 2.36589 42.8732 2.24609 42.5962C2.1263 42.3117 2.06641 42.0122 2.06641 41.6978V30.1978ZM31.8159 33.6455C31.8159 35.8916 30.8576 37.1719 28.9409 37.4863L31.9731 44H29.4238L26.4365 37.5649H21.394V44H19.0918V27.8955H27.9077C30.5132 27.8955 31.8159 29.202 31.8159 31.8149V33.6455ZM21.394 35.2627H27.7842C28.3981 35.2627 28.8398 35.1279 29.1094 34.8584C29.3789 34.5889 29.5137 34.1471 29.5137 33.5332V31.9272C29.5137 31.3133 29.3789 30.8716 29.1094 30.6021C28.8398 30.3325 28.3981 30.1978 27.7842 30.1978H21.394V35.2627ZM36.7349 27.8955L41.418 35.4199L46.1123 27.8955H48.7852L42.5747 37.6099V44H40.2725V37.6099L34.062 27.8955H36.7349ZM51.3232 44V27.8955H60.1392C62.7446 27.8955 64.0474 29.202 64.0474 31.8149V34.106C64.0474 36.7189 62.7446 38.0254 60.1392 38.0254H53.6255V44H51.3232ZM53.6255 35.7231H60.0156C60.6296 35.7231 61.0713 35.5884 61.3408 35.3188C61.6104 35.0493 61.7451 34.6076 61.7451 33.9937V31.9272C61.7451 31.3133 61.6104 30.8716 61.3408 30.6021C61.0713 30.3325 60.6296 30.1978 60.0156 30.1978H53.6255V35.7231ZM65.8892 27.8955H78.7705V30.1978H73.481V44H71.1787V30.1978H65.8892V27.8955ZM95.3354 41.6978C95.3354 42.0122 95.2756 42.3117 95.1558 42.5962C95.036 42.8732 94.8713 43.1165 94.6616 43.3262C94.452 43.5358 94.2049 43.7005 93.9204 43.8203C93.6434 43.9401 93.3477 44 93.0332 44H83.8354C83.521 44 83.2215 43.9401 82.937 43.8203C82.66 43.7005 82.4167 43.5358 82.207 43.3262C81.9974 43.1165 81.8327 42.8732 81.7129 42.5962C81.5931 42.3117 81.5332 42.0122 81.5332 41.6978V30.1978C81.5332 29.8833 81.5931 29.5876 81.7129 29.3105C81.8327 29.026 81.9974 28.7827 82.207 28.5806C82.4167 28.3709 82.66 28.2062 82.937 28.0864C83.2215 27.9591 83.521 27.8955 83.8354 27.8955H93.0332C93.3477 27.8955 93.6434 27.9591 93.9204 28.0864C94.2049 28.2062 94.452 28.3709 94.6616 28.5806C94.8713 28.7827 95.036 29.026 95.1558 29.3105C95.2756 29.5876 95.3354 29.8833 95.3354 30.1978V41.6978ZM83.8354 30.1978V41.6978H93.0332V30.1978H83.8354ZM116.864 35.5996C117.201 35.7044 117.508 35.8542 117.785 36.0488C118.062 36.2435 118.298 36.4943 118.493 36.8013C118.687 37.1007 118.837 37.4564 118.942 37.8682C119.047 38.2799 119.099 38.7516 119.099 39.2832V40.0918C119.099 42.6973 117.796 44 115.191 44H106.375V27.8955H114.73C117.336 27.8955 118.639 29.202 118.639 31.8149V32.1069C118.639 33.0129 118.493 33.7541 118.201 34.3306C117.916 34.8996 117.471 35.3226 116.864 35.5996ZM108.632 36.981V41.7427H115.124C115.73 41.7427 116.168 41.6004 116.438 41.3159C116.707 41.0314 116.842 40.5859 116.842 39.9795V38.7329C116.842 38.119 116.707 37.6735 116.438 37.3965C116.168 37.1195 115.73 36.981 115.124 36.981H108.632ZM108.632 30.1528V34.7349H114.82C115.374 34.7124 115.771 34.5627 116.011 34.2856C116.258 34.0011 116.381 33.5669 116.381 32.9829V31.9272C116.381 31.3133 116.247 30.8641 115.977 30.5796C115.708 30.2951 115.27 30.1528 114.663 30.1528H108.632ZM129.678 27.8955L135.889 44H133.586L132.16 40.2939H124.894L123.468 44H121.166L127.376 27.8955H129.678ZM125.77 37.9917H131.273L128.533 30.894L125.77 37.9917ZM135.428 27.8955H148.31V30.1978H143.02V44H140.718V30.1978H135.428V27.8955ZM149.691 27.8955H162.572V30.1978H157.283V44H154.98V30.1978H149.691V27.8955ZM167.637 27.8955V41.6978H175.914V44H165.335V27.8955H167.637ZM178.677 27.8955H190.413V30.1978H180.979V34.8022H189.031V37.1045H180.979V41.6978H190.413V44H178.677V27.8955Z"
                  fill="#DDDDDD"
                />
              </svg>
            </Link> } 

            {logo && logo}

          </PopoverAnchor>
        </Popover>
      </div>
    </>
  );
}
