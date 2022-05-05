import { useRouter } from "next/router";
import { useAuth } from "../../components/AuthProvider";
import { useEffect } from "react";
const Post = () => {
  const router = useRouter();
  const { roomid } = router.query;
  const { loggedIn } = useAuth();

  useEffect(() => {
    if (!roomid) {
      return;
    }

    loggedIn
      ? router.push(`/game/${roomid}`)
      : router.push(`/join/login?roomid=${roomid}`);
  }, [roomid]);

  return "";
};

export default Post;
