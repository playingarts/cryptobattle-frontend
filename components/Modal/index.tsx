import { styled, keyframes } from "@stitches/react";
import { violet, blackA, mauve, green } from "@radix-ui/colors";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FC, HTMLAttributes, ReactNode } from "react";

import Line from "../Line";
import Text from "../Text";
import CloseMenu from "../Icons/CloseMenu";

const overlayShow = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

const contentShow = keyframes({
  "0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
  "100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

const StyledOverlay = styled(DialogPrimitive.Overlay, {
  background: "rgba(0 0 0 / 0.5)",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "start",
  overflowY: "auto",
  zIndex: 9999,

  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  },
});

const StyledContent = styled(DialogPrimitive.Content, {
  minWidth: 300,
  minHeight: 800,

  marginTop: 14,
  maxWidth: 1020,
  borderRadius: 20,
  zIndex: 9999,
  background: "white",
  padding: "90px 105px",
  // boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  position: "relative",
  // '@media (prefers-reduced-motion: no-preference)': {
  //   animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  // },
});

const Content: FC<Props> = ({ children, ...props }) => {
  return (
    <DialogPrimitive.Portal>
      <StyledOverlay>
        {" "}
        <StyledContent {...props}>{children}</StyledContent>
      </StyledOverlay>
    </DialogPrimitive.Portal>
  );
};

const StyledTitle = styled(DialogPrimitive.Title, {
  margin: 0,
  fontWeight: 500,
  color: mauve.mauve12,
  fontSize: 17,
});

const StyledDescription = styled(DialogPrimitive.Description, {
  margin: "10px 0 20px",
  color: mauve.mauve11,
  fontSize: 15,
  lineHeight: 1.5,
});

// Exports
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = Content;
export const DialogTitle = StyledTitle;
export const DialogDescription = StyledDescription;
export const DialogClose = DialogPrimitive.Close;

// Your app...
const Flex = styled("div", { display: "flex" });
const Box = styled("div", {});

const Button = styled("button", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
  padding: "0 15px",
  fontSize: 15,
  lineHeight: 1,
  fontWeight: 500,
  height: 35,

  variants: {
    variant: {
      violet: {
        backgroundColor: "white",
        color: violet.violet11,
        boxShadow: `0 2px 10px ${blackA.blackA7}`,
        "&:hover": { backgroundColor: mauve.mauve3 },
        "&:focus": { boxShadow: `0 0 0 2px black` },
      },
      green: {
        backgroundColor: green.green4,
        color: green.green11,
        "&:hover": { backgroundColor: green.green5 },
        "&:focus": { boxShadow: `0 0 0 2px ${green.green7}` },
      },
    },
  },

  defaultVariants: {
    variant: "violet",
  },
});

export type Props = HTMLAttributes<HTMLDivElement>;

interface Modal extends Props {
  title: string;
  trigger: ReactNode;
  description: string;
}

export const Modal: FC<Modal> = ({ title, description, trigger, children }) => {

  
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle>
          <Text
            variant="h3"
            css={{ fontSize: "45px", color: "#000", margin: 0 }}
          >
            {title}
          </Text>
        </DialogTitle>

        <DialogDescription>
          <Text
            variant="body2"
            css={{
              fontSize: "22px",
              color: "#000",
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            {description}
          </Text>
        </DialogDescription>
        <Line></Line>
        {children}
        <Flex css={{ marginTop: 25, justifyContent: "flex-end" }}></Flex>
        <DialogClose asChild>
          <div
            aria-label="Close"
            css={{
              margin: 0,
              padding: 8,
              position: "absolute",
              top: 23,
              right: 24,
              cursor: "pointer",
              transition: "all 600ms",
              "&:hover": {
                transform: `rotateZ(90deg)`,
              },
            }}
          >
            <CloseMenu />
          </div>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
