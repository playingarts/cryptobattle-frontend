import UserAvatar from "../UserAvatar";

import { FC, HTMLAttributes } from "react";

export type Props = HTMLAttributes<HTMLDivElement>;
interface User extends Props {
  user:  any,
}

const NavProfile: FC<User> = (props) => {
      // eslint-disable-next-line
    // @ts-ignore
  const user  =  window.user ? JSON.parse(window.user) : props.user

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
        profilePictureUrl={user && user.profilePictureUrl}
      />
    </div>
  );
};

export default NavProfile;
