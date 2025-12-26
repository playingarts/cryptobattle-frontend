import UserAvatar from "../UserAvatar";
import { useAuth } from "../AuthProvider";

import { FC, HTMLAttributes } from "react";

export type Props = HTMLAttributes<HTMLDivElement>;
interface NavProfileProps extends Props {
  user?: { profilePictureUrl?: string };
}

const NavProfile: FC<NavProfileProps> = (props) => {
  const { user: authUser } = useAuth();
  const user = props.user || authUser;

  return (
    <div style={{ cursor: "pointer" }} {...props}>
      <UserAvatar
        css={{
          transition: "opacity 400ms",
          "&:hover": {
            opacity: 0.9,
          },
        }}
        profilePictureUrl={user?.profilePictureUrl || ""}
      />
    </div>
  );
};

export default NavProfile;
