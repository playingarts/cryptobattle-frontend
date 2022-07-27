import UserAvatar from "../UserAvatar";

import { FC, HTMLAttributes } from "react";

export type Props = HTMLAttributes<HTMLDivElement>;

import { useAuth } from "../AuthProvider";

const NavProfile: FC<Props> = (color, props) => {
  const { user } = useAuth();

  return (
    <div style={{ cursor: "pointer" }} {...props}>

          <UserAvatar
          color={color}
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
