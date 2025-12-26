import { useMetaMask } from "metamask-react";
import { useEffect, useState } from "react";
import Button from "../Button";
import store from "store";
import { HTMLAttributes, FC } from "react";
import { useAuth } from "../AuthProvider";
import Metamask from "../Icons/Metamask";
import axios from "axios";
import { useRouter } from "next/router";
import { logError } from "../../utils/errorHandler";
export type Props = HTMLAttributes<HTMLDivElement>;
interface MetamaskLogin extends Props {
  roomId?:  any,
}
const MetamaskLogin: FC<MetamaskLogin> = ({ roomId,...props }) => {
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
const router = useRouter();
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

  const sendSignature = async (metamaskSignKeyLocal = metamaskSignKey, regTokenLocal = regToken, accountLocal = account) => {
    // console.log('sendSignature', metamaskSignKeyLocal, regTokenLocal, account)
    ethereum
      .request({
        method: "personal_sign",
        params: [metamaskSignKeyLocal, accountLocal],
      })
      .then((signature: string) => {
        // console.log('eth request success', signature)
        if (loggedIn) {
          localStorage.setItem("adding-metamask", "true");
        }
        const url = !loggedIn
          ? `${process.env.NEXT_PUBLIC_API_URL}/auth/metamask/callback?walletAddress=${accountLocal}&signature=${signature}`
          : `${process.env.NEXT_PUBLIC_API_URL}/auth/metamask/callback?walletAddress=${accountLocal}&signature=${signature}` +
            "&accesstoken=" +
            localStorage.getItem("accessToken");

            // console.log('url', url)
        axios
          .get(url, {
            headers: {
              regToken: regTokenLocal,
              "content-type": "application/json",
            },
          })
          .then((result: any) => {
            setToken(result.data.accesstoken);
            setTimeout(() => {
           roomId ?   router.push(`/game/${roomId}?join=true`)
            : router.push("/dashboard");
   
            }, 1000);
            console.log(result.data.accesstoken);
          })
          .catch((err: unknown) => {
            logError("MetamaskLogin.sendSignature", err);
          });
      })
      .catch((err: unknown) => {
        logError("MetamaskLogin.personalSign", err);
        setSignature((prev) => ({ ...prev, signing: false }));
      });
  };

  const requestSignature = async () => {
    setSignature((prev) => ({ ...prev, signing: true }));
    console.log('requestSignature')
    const address: string = (await ethereum.request({ method: 'eth_requestAccounts' }))[0];
    console.log(address)
    connect();


    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/metamask?walletAddress=${address}`,
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
          sendSignature(result.data.metamaskSignKey, result.data.regtoken, address);
     
      })
      .catch((err: unknown) => {
        logError("MetamaskLogin.requestSignature", err);
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
        {signing ? "signing" : loggedIn ? "connect metamask" : "metamask"}
      </Button>
      // eslint-disable-next-line
      // @ts-ignore-end
    );
  }

  return <div></div>;
};

export default MetamaskLogin;
