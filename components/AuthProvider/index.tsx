import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  ReactNode,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "../../components/Link";

import { api } from "../../api";
import { useNotifications } from "../NotificationProvider";

import Text from "../Text/";
import Button from "../Button/";
import Warning from "../../components/Icons/Warning";


type AuthProviderProps = { children: ReactNode };

// type MetamaskUser = { address: string; signature: string };
import Loader from "../Loader";



export type IAuthProviderContext = {
  logout: () => void;
  loggedIn: boolean;
  user: any;
  setToken: any;
};

const getUser = () => {
  return api.get("/api/rest/me");
};

const formatUserData = (data: any) => {
  data.isTwitterConnected =
    data.authProvider === "twitter" || data.authProvider === "unified";
  data.isMetamaskConnected =
    data.authProvider === "metamask" || data.authProvider === "unified";
  return data;
};

const AuthProviderContext = createContext<IAuthProviderContext | null>(null);

function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);

  const [authorized, setAuthorized] = useState(false);
  const { openNotification, closeNotification } = useNotifications();

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

  const setToken = useCallback((token: any) => {
    console.log(token, "token");
    localStorage.setItem("accessToken", token as string);
    getUser().then((data: any) => {
      const user = formatUserData(data);

      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("accessTokenExpire", data.accessTokenExpire);
      }

      setUser(user);
            // eslint-disable-next-line
    // @ts-ignore
      window.user = JSON.stringify(user)
      const roomid = localStorage.getItem("roomid");
      if (!localStorage.getItem("adding-metamask")) {
        console.log('/dashboard redirect here.')
        setTimeout(() => {
          roomid
            ? router.push(`/game/${roomid}?join=true`)
            : router.push("/dashboard");
        }, 1000);
      } else {
        // localStorage.removeItem("adding-metamask");
      }

      localStorage.removeItem("roomid");
    });
  }, []);

  useEffect(() => {
    const isLoggedInCookie = () =>
      localStorage.getItem("accessToken") !== null ? true : false;

    setLoggedIn(isLoggedInCookie());

    if (isLoggedInCookie()) {
      getUser().then((data: any) => {
        console.log(data);

        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("accessTokenExpire", data.accessTokenExpire);
        }

        const user = formatUserData(data);
        setUser(user);
      // eslint-disable-next-line
    // @ts-ignore
        window.user = JSON.stringify(user)

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
        setToken(accesstoken as string);
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


      if (path.includes('/game')) {
        // router.push("/");
        openNotification({
          description: (
            <div>
              <Text
                variant="h1"
                css={{
                  fontSize: 35,
                  lineHeight: "45.5px",
                  marginBottom: 0,
                  marginTop: 60,
                }}
              >
                Ended
              </Text>
              <Text
                variant="body3"
                css={{ fontSize: 22, lineHeight: "33px", marginBottom: 0 }}
              >
                The game you are trying to join has ended.
              </Text>
            </div>
          ),
          dark: false,
          icon: <Warning />,
          iconColor: "#FF6F41",
          footer: (
            <div css={{ display: "flex" }}>
              <Button component={Link}   onClick={closeNotification} href="/" >
                Return to Home
              </Button>
            </div>
          ),
        });
      }else {
        router.push({
          pathname: "/401",
        });
      }
    } else {
      setAuthorized(true);
    }
  }

  const logout = () => {
    axios
      .get(
        "https://cryptobattle-backend-production.up.railway.app/auth/logout?accesstoken=" +
          localStorage.getItem("accessToken"),
        {
          headers: {
            accesstoken: localStorage.getItem("accessToken"),
            "content-type": "application/json",
          },
        }
      )
      .then(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("signature");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("accessTokenExpire");
        setTimeout(() => {
          router.push("/");
        }, 0);
      })
      .catch((err) => {
        console.log(err);
      });

    // localStorage.removeItem("accessToken");
    // localStorage.removeItem("signature");
  };

  const memoedValue = useMemo(
    () => ({
      authorized,
      setToken,
      user,
      loggedIn,
      logout,
    }),
    [authorized, loggedIn, user, logout, setToken]
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
