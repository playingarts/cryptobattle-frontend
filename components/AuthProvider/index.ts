import {  useState, useEffect} from "react";
import { useRouter } from "next/router";



// eslint-disable
const AuthProvider = ({ children }: { children: any }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  const { accessToken } = router.query;
 
  useEffect(() => {
    const isLoggedInCookie = () => (localStorage.getItem("accessToken") !== null || localStorage.getItem("signature")) ? true : false
    isLoggedInCookie() ?  router.push("/dashboard") : null

    authCheck(router.asPath);
    const hideContent = () => setAuthorized(false);
    router.events.on("routeChangeStart", hideContent);

    // on route change complete - run auth check
    router.events.on("routeChangeComplete", authCheck);

    if (router.isReady) {
      if (!accessToken && !localStorage.getItem("accessToken")) {

        return;
      }
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken as string);
        // router.push("/dashboard")
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
    const isLoggedInCookie = () => (localStorage.getItem("accessToken") !== null || localStorage.getItem("signature")) ? true : false

    // redirect to login page if accessing a private page and not logged in
    const publicPaths = ["/", "/401"];
    const path = url.split("?")[0];
    console.log(isLoggedInCookie(), "authCheck loaded");
    console.log(path)
    // setAuthorized(true);

    // return 
    if (!isLoggedInCookie() && !publicPaths.includes(path)) {
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
export { AuthProvider };

