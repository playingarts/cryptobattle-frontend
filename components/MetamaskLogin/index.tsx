import { useMetaMask } from "metamask-react";
import { useEffect, useState } from "react";
import Button from "../Button";
import store from "store";
import { useRouter } from "next/router";
import { HTMLAttributes, FC } from "react";
import Link from "../Link";
import { useAuth } from "../AuthProvider";
import Metamask from "../Icons/Metamask";

export type Props = HTMLAttributes<HTMLDivElement>;

const MetamaskLogin: FC<Props> = ({ ...props }) => {
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

  const { loggedIn, user } = useAuth();

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

    console.log(ethereum);
    ethereum
      .request({
        method: "personal_sign",
        params: [metamaskSignKey, account],
      })
      .then((signature: string) => {
        // how to check if me has no twitter.
        let url = `https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask/callback?walletAddress=${account}&signature=${signature}`;

        if (loggedIn) {
          url = url + `&?accesstoken=${localStorage.getItem("accessToken")}`;
        }

        if (user.metamask.address !== account) {
          url = url + `&?&swap=1`;
        }

        window.location.href = url;

        // router.push("/dashboard");
      })
      .catch(() => setSignature((prev) => ({ ...prev, signing: false })));
  }, [router.isReady, ethereum, metamaskSignKey, account]);

  if (user && user.metamask && Object.keys(user.metamask).length > 0) {
    return (
      // eslint-disable-next-line
      // @ts-ignore-start
      <Button
        {...props}
        Icon={Metamask}
        css={() => ({
          background: "rgb(248, 157, 53)",
          color: "#fff",
          pointerEvents: "none",
        })}
      >
        Connected
      </Button>
      // eslint-disable-next-line
      // @ts-ignore-end
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
    };

    return (
      // eslint-disable-next-line
      // @ts-ignore-start
      <Button
        {...props}
        css={() => ({
          background: "rgb(248, 157, 53)",
          color: "#fff",
        })}
        component={Link}
        color="black"
        Icon={Metamask}
        loading={signing}
        onClick={requestSignature}
      >
        {signing
          ? "signing"
          : loggedIn
          ? "connect metamask"
          : "sign with metamask"}
      </Button>
      // eslint-disable-next-line
      // @ts-ignore-end
    );
  }

  return <div></div>;
};

export default MetamaskLogin;
