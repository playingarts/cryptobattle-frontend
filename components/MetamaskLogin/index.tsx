import { useMetaMask } from "metamask-react";
import { useEffect, useState } from "react";
import Button from "../Button";
import store from "store";
import { useRouter } from "next/router";


// import { useRouter } from "next/router";

import { useAuth } from "../AuthProvider";

const MetamaskLogin: any = (isMetamaskConnected: boolean) => {
  const { ethereum, account, connect } = useMetaMask();
  const [
    { account: signedAccount, expiry, signature, signing },
    setSignature,
  ] = useState(
    (store.get("signature") as {
      account?: string;
      expiry?: number;
      signature?: string;
      signing?: boolean;
    }) || {}
  );
  const router = useRouter();

  const { metamaskSignKey } = router.query;

  const { loggedIn } = useAuth();




  useEffect(() => {
    if (!account) {
      return;
    }
    if (!account || !signature || !expiry || expiry < Date.now()) {
      setSignature({});
      store.remove("signature");

      return;
    }

    store.set("signature", { expiry, signature, account });
  }, [account, signature, expiry, signedAccount]);

  useEffect(() => {
    if (!metamaskSignKey || !ethereum) {
      return;
    }
    // const address: string = (await ethereum.enable())[0];
    // connect();

    // window.location.href= "https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask?walletAddress=" + address

      console.log(ethereum)
      ethereum
        .request({
          method: "personal_sign",
          params: [metamaskSignKey, account],
        })
        .then((signature: string) => {
          // how to check if me has no twitter.
          let url = `https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask/callback?walletAddress=${account}&signature=${signature}`
          
          if (loggedIn) {
            url = url + `&?accesstoken=${localStorage.getItem("accessToken")}`
          }

          window.location.href = url;
          
          // router.push("/dashboard");
        })
        .catch(() => setSignature((prev) => ({ ...prev, signing: false })));

  }, [router.isReady, ethereum, metamaskSignKey, account]);


  if (isMetamaskConnected) {

    return (
      <Button
        css={() => ({
          background: "rgb(248, 157, 53)",
          color: "#fff",
          pointerEvents: 'none',
        })}
      >
        Connected
      </Button>
    );
  }


  

  if (account !== signedAccount) {
    const requestSignature = async () => {
      setSignature((prev) => ({ ...prev, signing: true }));

      const address: string = (await ethereum.enable())[0];
      connect();

      window.location.href =
        "https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask?walletAddress=" +
        address;

      // ethereum
      //   .request({
      //     method: "personal_sign",
      //     params: ["Play Crypto battle", address],
      //   })
      //   .then((signature: string) => {
      //     console.log(signature);
      //     setSignature({
      //       account: address,
      //       expiry: Date.now() + 1000 * 60 * 60,
      //       signature,
      //       signing: false,
      //     });
      //     localStorage.setItem("accessToken", "set from wallet");
      //     router.push("/dashboard");
      //   })
      //   .catch(() => setSignature((prev) => ({ ...prev, signing: false })));
    };

    return (
      <Button
        css={() => ({
          background: "rgb(248, 157, 53)",
          color: "#fff",
        })}
        loading={signing}
        onClick={requestSignature}
      >
        {signing
          ? "signing"
          : loggedIn
          ? "connect metamask"
          : "sign with metamask"}
      </Button>
    );
  }

  return "";
};

export default MetamaskLogin;
