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

type MetamaskUser = { address: string; signature: string };
import Loader from "../Loader";

interface User {
  userId: string;
  state: string;
  name: string;
  username: string;
  metamask: MetamaskUser;
  profilePictureUrl: string;
  isTwitterConnected: boolean;
  isMetamaskConnected: boolean;
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

  const [user, setUser] = useState({
    userId: "",
    state: "",
    name: "",
    username: "",
    metamask: { address: "", signature: "" },
    profilePictureUrl: "",
    isMetamaskConnected: false,
    isTwitterConnected: false,
  });

  const { accesstoken } = router.query;

  useEffect(() => {
    console.log('auth thing happens')
    const isLoggedInCookie = () =>
      localStorage.getItem("accessToken") !== null ? true : false;

    setLoggedIn(isLoggedInCookie());

    if (isLoggedInCookie()) {
      getUser().then(({ data }) => {
        console.log(data);
        data.isTwitterConnected = data.authProvider === "twitter" || data.authProvider === "unified";
        data.isMetamaskConnected =
          data.authProvider === "metamask" || data.authProvider === "unified";

        setUser(data);
      });
    }

    authCheck(router.asPath);
    const hideContent = () => {
    // setAuthorized(false)
    };
    router.events.on("routeChangeStart", hideContent);

    // on route changes complete - run auth checking
    router.events.on("routeChangeComplete", authCheck);

    if (router.isReady) {
      if (accesstoken) {
        localStorage.setItem("accessToken", accesstoken as string);
        getUser().then(({ data }) => {
          data.isTwitterConnected = data.authProvider === "twitter" || data.authProvider === "unified"
          data.isMetamaskConnected =
            data.authProvider === "metamask" || data.authProvider === "unified";
  
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
    console.log('auth check happens')

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
    // axios
    //   .get(
    //     "https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/logout?accesstoken=" +
    //       localStorage.getItem("accessToken"),
    //     {
    //       headers: {
    //         accesstoken: localStorage.getItem("accessToken"),
    //         "content-type": "application/json",
    //       },
    //     }
    //   )
    //   .then(() => {
    //     localStorage.removeItem("accessToken");
    //     localStorage.removeItem("signature");
    //   });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("signature");
    setTimeout(() => {
      router.push("/");
    }, 0);
  };

  const memoedValue = useMemo(
    () => ({
      authorized,

      user,
      loggedIn,
      logout,
    }),
    [authorized, loggedIn, user, logout]
  );

  if (!authorized) {
    return (
      <div
        css={{
          height: "100vh",
          background: "#181818",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader
          css={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%) scale(2)",
            lineHeight: 1,
            color: "#fff",
          }}
        />
      </div>
    );
  }

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
