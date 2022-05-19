import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  ReactNode,
  useState,
} from "react";
import { useRouter } from "next/router";
import axios from "axios";
type AuthProviderProps = { children: ReactNode };

type MetamaskUser = { address: string, signature: string };


interface User {
  userId: string;
  state: string;
  name: string;
  metamask: MetamaskUser,
  profilePictureUrl: string
}

export type IAuthProviderContext = {
  logout: () => void;
  loggedIn: boolean;
  user: User;
};

const getUser = () => {
  return axios.get(
    "https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/api/rest/me",

    {
      headers: {
        accesstoken: localStorage.getItem("accessToken"),
        "content-type": "application/json",
      },
    }
  );
};

const AuthProviderContext = createContext<IAuthProviderContext | null>(null);

function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);

  const [authorized, setAuthorized] = useState(false);

  const [user, setUser] = useState({ userId: "", state: "", name: "", metamask: {address: "", signature: ""}, profilePictureUrl: "" });

  const { accesstoken } = router.query;

  useEffect(() => {
    const isLoggedInCookie = () =>
      localStorage.getItem("accessToken") !== null ? true : false;

    setLoggedIn(isLoggedInCookie());

    if (isLoggedInCookie()) {
      getUser().then(({ data }) => {
        console.log(data);
        setUser(data);
      });
    }

    authCheck(router.asPath);
    const hideContent = () => setAuthorized(false);
    router.events.on("routeChangeStart", hideContent);

    // on route changes complete - run auth checking
    router.events.on("routeChangeComplete", authCheck);

    if (router.isReady) {
      if (accesstoken) {
        localStorage.setItem("accessToken", accesstoken as string);
        getUser().then(({ data }) => {
          setUser(data);
          console.log("data");

          const roomid = localStorage.getItem("roomid");

          roomid ? router.push(`/game/${roomid}`) : router.push("/dashboard");
          localStorage.removeItem("roomid");
        });
        // )
      }
    }

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off("routeChangeStart", hideContent);
      router.events.off("routeChangeComplete", authCheck);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  function authCheck(url: string) {
    const isLoggedInCookie = () =>
      localStorage.getItem("accessToken") !== null ? true : false;

    const publicPaths = ["/", "/401", "/join/login", "/join", "/play"];
    const path = url.split("?")[0];

    setLoggedIn(isLoggedInCookie());

    if (
      !isLoggedInCookie() &&
      !publicPaths.includes(path) &&
      !path.includes("/join")
    ) {
      setAuthorized(false);

      router.push({
        pathname: "/401",
      });
    } else {
      setAuthorized(true);
    }
  }
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("signature");
    router.push("/");
  };

  const memoedValue = useMemo(
    () => ({
      authorized,

      user,
      loggedIn,
      logout,
    }),
    [authorized, loggedIn, user]
  );

  return (
    <AuthProviderContext.Provider value={memoedValue}>
      {authorized && children}
    </AuthProviderContext.Provider>
  );
}

function useAuth(): IAuthProviderContext {
  const context = useContext(AuthProviderContext);

  if (context == undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };
