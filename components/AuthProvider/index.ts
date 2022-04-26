import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useMetaMask } from "metamask-react";
// import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

// import { userService } from 'services';

export { AuthProvider };

function AuthProvider({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  const { accessToken } = router.query;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { status } = useMetaMask();

  // const isLoggedIn = () => localStorage.getItem("accessToken") !== null;

  useEffect(() => {
    // if (status === "connected" || isLoggedIn) {
    //   router.pathname === "/" ? router.push("/Dashboard") : null;
    // }

    // on initial load - run auth check
    authCheck(router.asPath);

    // on route change start - hide page content by setting authorized to false
    const hideContent = () => setAuthorized(false);
    router.events.on("routeChangeStart", hideContent);

    // on route change complete - run auth check
    router.events.on("routeChangeComplete", authCheck);

    if (router.isReady) {
      if (!accessToken && !localStorage.getItem("accessToken")) {
        setIsLoggedIn(false);

        return;
      }
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken as string);
        router.push("/dashboard").then(() => {
          setIsLoggedIn(true);
          setIsLoading(false);
        });
      }
    }

    // const token = localStorage.getItem("accessToken");
    // if (token != null) {
    //   router.push("/Dashboard").then(() => {
    //     setIsLoggedIn(true);
    //     setIsLoading(false);
    //   });
    //   return;
    // }

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off("routeChangeStart", hideContent);
      router.events.off("routeChangeComplete", authCheck);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  function authCheck(url: string) {
    console.log(localStorage.getItem("accessToken"))
    const isLoggedInCookie = () => localStorage.getItem("accessToken") !== null || localStorage.getItem("signature")

    // setIsLoggedIn(true)
    // redirect to login page if accessing a private page and not logged in
    const publicPaths = ["/", "/401"];
    const path = url.split("?")[0];
    console.log(isLoggedInCookie(), "authCheck loaded");

    if (!isLoggedInCookie() && !publicPaths.includes(path)) {
      console.log(isLoggedInCookie);
      setAuthorized(false);
      router.push({
        pathname: "/401",
        // query: { returnUrl: router.asPath }
      });
    } else {
      setAuthorized(true);
    }
  }

  return authorized && children;
}
