import UserAvatar from "../UserAvatar";

import { FC, HTMLAttributes } from "react";

export type Props = HTMLAttributes<HTMLDivElement>;


const NavProfile: FC<Props> = (props) => {
      // eslint-disable-next-line
    // @ts-ignore
  const user  =  window.user ? JSON.parse(window.user) : {}

  return (
    <div style={{ cursor: "pointer" }} {...props}>
      <UserAvatar
        css={{
          transition: "opacity 400ms",
          transform: "scale(0.9,0.9)",
          "&:hover": {
            opacity: 0.9,
          },
        }}
        profilePictureUrl={user.profilePictureUrl}
      />
    </div>
  );
};

export default NavProfile;
