import { useMetaMask } from "metamask-react";
import { useEffect, useState } from "react";
import Button from "../Button";
import store from "store";
import { useRouter } from "next/router";
import { HTMLAttributes, FC } from "react";
import { useAuth } from "../AuthProvider";
import Metamask from "../Icons/Metamask";
import axios from "axios";

export type Props = HTMLAttributes<HTMLDivElement>;

const MetamaskLogin: FC<Props> = ({ ...props }) => {
  const { ethereum, account, connect } = useMetaMask();
  const [{ account: signedAccount, expiry, signature, signing }, setSignature] =
    useState(
      (store.get("signature") as {
        account?: string;
        expiry?: number;
        signature?: string;
        signing?: boolean;
      }) || {}
    );
  const router = useRouter();

  const [metamaskSignKey, setMetamaskSignKey] = useState(null);
  const [regToken, setRegToken] = useState(null);

  // const { metamaskSignKey } = router.query;

  const { loggedIn, user, setToken } = useAuth();

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

    console.log("h");

    // First call backend url /auth/metamask?walletAddress=0x1yxysy. It will return a JSON object:

    ethereum
      .request({
        method: "personal_sign",
        params: [metamaskSignKey, account],
      })
      .then((signature: string) => {



        axios
        .get(
          `https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask/callback?walletAddress=${account}&signature=${signature}`,
          {
            headers: {
              regToken: regToken,
              "content-type": "application/json",
            },
          }
        )
        .then((result: any) => {
          setToken(result.data.accesstoken)
          console.log(result.data.accesstoken)
        })
        .catch((err) => {
          console.log(err);
        });

        console.log("signature", signature, "regtoken", regToken);
        // let url = `https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask/callback?walletAddress=${account}&signature=${signature}`;

        // if (loggedIn) {
        //   url = url + `&?accesstoken=${localStorage.getItem("accessToken")}`;
        // }

        // if (user.metamask.address && user.metamask.address !== account) {
        //   url = url + `&?&swap=1`;
        // }

        // window.location.href = url;

        // router.push("/dashboard");
      })
      .catch(() => setSignature((prev) => ({ ...prev, signing: false })));
  }, [ metamaskSignKey, account, regToken]);

  const requestSignature = async () => {
    setSignature((prev) => ({ ...prev, signing: true }));

    const address: string = (await ethereum.enable())[0];
    connect();

    axios
      .get(
        "https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask?walletAddress=" +
          address,

        {
          headers: {
            // accesstoken: localStorage.getItem("accessToken"),
            "content-type": "application/json",
          },
        }
      )
      .then((result: any) => {
        setMetamaskSignKey(result.data.metamaskSignKey);

        setRegToken(result.data.regtoken);
      })
      .catch((err) => {
        console.log(err);
      });

    // window.location.href =
    //   "https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask?walletAddress=" +
    //   address;
  };

  if (!ethereum) {
    return (
      // eslint-disable-next-line
      // @ts-ignore-start
      <Button
        {...props}
        Icon={Metamask}
        loading={signing}
        css={() => ({
          background: "rgb(248, 157, 53)",
          color: "#fff",
          pointerEvents: "none",
        })}
      >
        Install Metamask
      </Button>
      // eslint-disable-next-line
      // @ts-ignore-end
    );
  }

  if (user && user.isMetamaskConnected) {
    return (
      // eslint-disable-next-line
      // @ts-ignore-start
      <Button
        {...props}
        Icon={Metamask}
        loading={signing}
        onClick={requestSignature}
        css={() => ({
          background: "rgb(248, 157, 53)",
          color: "#fff",
        })}
      >
        Change address
      </Button>
      // eslint-disable-next-line
      // @ts-ignore-end
    );
  }

  if (account !== signedAccount) {
    return (
      // eslint-disable-next-line
      // @ts-ignore-start
      <Button
        {...props}
        css={() => ({
          background: "rgb(248, 157, 53)",
          color: "#fff",
        })}
        // component={''}
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
