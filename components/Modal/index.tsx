import { styled, keyframes } from "@stitches/react";
import { mauve } from "@radix-ui/colors";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FC, HTMLAttributes, ReactNode } from "react";

import Line from "../Line";
import Text from "../Text";
import CloseMenu from "../Icons/CloseMenu";

const overlayShow = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

// const contentShow = keyframes({
//   "0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
//   "100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
// });

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
  marginTop: 10,
  marginBottom: 10,
  maxWidth: 1180,
  borderRadius: 20,
  zIndex: 9999,
  padding: "20px 5px",
  background: "white",
  // boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  position: "relative",
  // '@media (prefers-reduced-motion: no-preference)': {
  //   animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  // },
});

const Content: FC<Props> = ({ children, ...props }) => {
  return (
    <DialogPrimitive.Portal>
      <StyledOverlay id="overlay">
        {" "}
        <StyledContent {...props}>
          <div
            id="modal"
            css={{
              padding: "90px 105px",
              height: "auto",
              overflow: "auto",
              scrollbarWidth: "none",
            }}
          >
            {children}
          </div>
        </StyledContent>
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

export type Props = HTMLAttributes<HTMLDivElement>;

interface Modal extends Props {
  title: string;
  trigger: ReactNode;
  description?: string;
  onClose?: any;
}

export const Modal: FC<Modal> = ({
  title,
  description,
  trigger,
  onClose,
  children,
}) => {
  return (
    <Dialog onOpenChange={onClose}>
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

        {description && (
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
        )}
        <Line></Line>
        {children}
        <Flex css={{ marginTop: 25, justifyContent: "flex-end" }}></Flex>
        <DialogClose asChild>
          <div
            aria-label="Close"
            css={{
              margin: 0,
              // padding: 15,
              position: "absolute",
              top: 30,
              right: 30,
              cursor: "pointer",
              backgroundColor: "#EAEAEA",
              borderRadius: "50px",
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
