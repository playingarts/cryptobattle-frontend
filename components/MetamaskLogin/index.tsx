import { useMetaMask } from "metamask-react";
import { useEffect, useState } from "react";
import Button, { Props as ButtonProps } from "../Button";
import store from "store";
import { FC } from "react";
import { useAuth } from "../AuthProvider";
import { logError } from "../../utils/errorHandler";
import Metamask from "../Icons/Metamask";
import axios from "axios";
import { useRouter } from "next/router";

interface MetamaskLoginProps extends Omit<ButtonProps, 'Icon' | 'loading' | 'onClick'> {
  roomId?: string | string[];
}

const MetamaskLogin: FC<MetamaskLoginProps> = ({ roomId, ...props }) => {
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
          ? `https://cryptobattle-backend-production.up.railway.app/auth/metamask/callback?walletAddress=${accountLocal}&signature=${signature}`
          : `https://cryptobattle-backend-production.up.railway.app/auth/metamask/callback?walletAddress=${accountLocal}&signature=${signature}` +
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
              const roomIdValue = Array.isArray(roomId) ? roomId[0] : roomId;
              roomIdValue ? router.push(`/game/${roomIdValue}?join=true`)
                : router.push("/dashboard");
            }, 1000);
          })
          .catch((err) => {
            logError(err, 'MetamaskLogin');
          });
      })
      .catch(() => setSignature((prev) => ({ ...prev, signing: false })));
  };

  const requestSignature = async () => {
    setSignature((prev) => ({ ...prev, signing: true }));
    const address: string = (await ethereum.request({ method: 'eth_requestAccounts' }))[0];
    connect();


    axios
      .get(
        "https://cryptobattle-backend-production.up.railway.app/auth/metamask?walletAddress=" +
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
          sendSignature(result.data.metamaskSignKey, result.data.regtoken, address);
     
      })
      .catch((err) => {
        logError(err, 'MetamaskLogin');
      });
  };

  if (!ethereum) {
    return (
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
    );
  }

  if (user && user.isMetamaskConnected) {
    return (
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
    );
  }

  if (account !== signedAccount) {
    return (
      <Button
        {...props}
        css={() => ({
          background: "rgb(248, 157, 53)",
          color: "#fff",
        })}
        color="black"
        Icon={Metamask}
        loading={signing}
        onClick={requestSignature}
      >
        {signing ? "signing" : loggedIn ? "connect metamask" : "metamask"}
      </Button>
    );
  }

  return <div></div>;
};

export default MetamaskLogin;
