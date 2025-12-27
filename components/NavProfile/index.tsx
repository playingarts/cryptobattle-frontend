import UserAvatar from "../UserAvatar";

import { FC, HTMLAttributes } from "react";
import { getUser as getGlobalUser } from "../../utils/gameState";

export type Props = HTMLAttributes<HTMLDivElement>;
interface User extends Props {
  user?:  any,
}

const NavProfile: FC<User> = (props) => {
  const globalUser = getGlobalUser();
  const user = globalUser ? JSON.parse(globalUser) : props.user

  return (
    <div style={{ cursor: "pointer" }} {...props}>
      <UserAvatar
        css={{
          transition: "opacity 400ms",
          // transform: "scale(0.7,0.7)",

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
