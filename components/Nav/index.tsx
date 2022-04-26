import { FC, HTMLAttributes } from "react";
import { colord } from "colord";

const Nav: FC<HTMLAttributes<HTMLElement>> = ({ ...props }) => {

  return (
    <nav
      {...props}
      css={(theme) => ({
        background: colord(theme.colors.text_title_dark)
          .alpha(1)
          .toRgbString(),
        borderRadius: theme.spacing(1),
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        height: theme.spacing(6),
        display: "flex",
        justifyContent: "center",
        fontSize: 18,
        alignItems: "center",
        boxSizing: "content-box",
      })}
    >

    </nav>
  );
};

export default Nav;
