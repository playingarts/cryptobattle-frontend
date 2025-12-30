import { useState } from "react";
import Button, { Props as ButtonProps } from "../Button";
import { FC } from "react";
import { useAuth } from "../AuthProvider";
import { logError } from "../../utils/errorHandler";
import axios from "axios";
import { useRouter } from "next/router";

interface GuestLoginProps extends Omit<ButtonProps, 'Icon' | 'loading' | 'onClick'> {
  roomId?: string | string[];
}

const GuestLogin: FC<GuestLoginProps> = ({ roomId, ...props }) => {
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const router = useRouter();

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptobattle-backend-production.up.railway.app';
      const response = await axios.get(
        `${apiUrl}/auth/guest`,
        {
          headers: {
            "content-type": "application/json",
          },
        }
      );

      setToken(response.data.accesstoken);
      setTimeout(() => {
        const roomIdValue = Array.isArray(roomId) ? roomId[0] : roomId;
        roomIdValue
          ? router.push(`/game/${roomIdValue}?join=true`)
          : router.push("/dashboard");
      }, 1000);
    } catch (err) {
      logError(err, 'GuestLogin');
      setLoading(false);
    }
  };

  return (
    <Button
      {...props}
      loading={loading}
      onClick={handleGuestLogin}
      css={() => ({
        background: "#4a4a4a",
        color: "#fff",
        "&:hover": {
          background: "#5a5a5a",
        },
      })}
    >
      {loading ? "joining..." : "Play as Guest"}
    </Button>
  );
};

export default GuestLogin;
