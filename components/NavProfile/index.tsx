import UserAvatar from "../UserAvatar";
import Button from "../Button";

import { FC, HTMLAttributes } from "react";

import { styled, keyframes } from "@stitches/react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

const slideUpAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(-2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(-2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});
const StyledContent = styled(PopoverPrimitive.Content, {
  borderRadius: 4,
  padding: 12,
  width: 200,
  backgroundColor: "white",
  marginTop: 0,
  cursor: 'pointer',
  marginLeft: 0,
  minHeight: 10,
  boxShadow:
    "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
  "@media (prefers-reduced-motion: no-preference)": {
    animationDuration: "400ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "forwards",
    willChange: "transform, opacity",
    '&[data-state="open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
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

export type Props = HTMLAttributes<HTMLDivElement>;

import { useAuth } from "../AuthProvider";
import Text from "../Text";

const NavProfile: FC<Props> = (props) => {
  const { user, logout} = useAuth();

  return (
    <div style={{ cursor: "pointer" }} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          {/* <IconButton aria-label="Update dimensions"> */}
          <UserAvatar
            css={{
              transition: "opacity 400ms",
              "&:hover": {
                opacity: 0.9,
              },
            }}
            profilePictureUrl={user.profilePictureUrl}
          />

          {/* </IconButton> */}
        </PopoverTrigger>
        <PopoverContent>

         <Text onClick={logout} css={{cursor: 'pointer', width: '100%', textAlign: 'center', margin: 0}}>Logout</Text>
          {/* <PopoverArrow /> */}
        </PopoverContent>
        <PopoverAnchor></PopoverAnchor>
      </Popover>
    </div>
  );
};

export default NavProfile;
