import { useMetaMask } from "metamask-react";
import { useEffect, useState } from "react";
import Button from "../Button";
import store from "store";
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

  const [metamaskSignKey, setMetamaskSignKey] = useState(null);
  const [regToken, setRegToken] = useState(null);

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



  const sendSignature = async () => {


    ethereum
      .request({
        method: "personal_sign",
        params: [metamaskSignKey, account],
      })
      .then((signature: string) => {
        if (!loggedIn) {
          localStorage.setItem("adding-metamask", 'true')
        }
        const url = !loggedIn ?  `https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask/callback?walletAddress=${account}&signature=${signature}` :  `https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask/callback?walletAddress=${account}&signature=${signature}` + '&accesstoken='+ localStorage.getItem("accessToken")
        axios
        .get(
          url,
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


      })
      .catch(() => setSignature((prev) => ({ ...prev, signing: false })));
  }


  const requestSignature = async () => {
    setSignature((prev) => ({ ...prev, signing: true }));

    const address: string = (await ethereum.enable())[0];
    connect();

    // const url = loggedIn ? 'https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask?walletAddress=' + address : 'https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask?walletAddress=' + address + '&accesstoken='+ localStorage.getItem("accessToken")

    axios
      .get(
        'https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/metamask?walletAddress=' + address,
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
        sendSignature()
      })
      .catch((err) => {
        console.log(err);
      });


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
