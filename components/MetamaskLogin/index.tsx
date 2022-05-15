import { useMetaMask } from "metamask-react";
import {  useEffect, useState } from "react";
import Button from "../Button";
import store from "store";
// import { useRouter } from "next/router";

import { useAuth } from "../AuthProvider";

const MetamaskLogin: any = () => {
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
  // const router = useRouter();

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


  // get account Address

  // redirect

  // get back ?metamaskSignKey

  // get signature

  // go to dashboard

  if (account !== signedAccount) {
    const requestSignature = async () => {
      setSignature((prev) => ({ ...prev, signing: true }));

      const address: string = (await ethereum.enable())[0];
      connect();


      window.location.href= "https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask?walletAddress=" + address


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
