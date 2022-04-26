import { useMetaMask } from "metamask-react";
import { FC, useEffect, useState } from "react";
import Button from "../Button";
import MetamaskButton from "../MetamaskButton";
import store from "store";

const MetaMaskLogin: FC = () => {
  const { status, ethereum, account } = useMetaMask();

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

  if (!account || status !== "connected") {
    return (
      <MetamaskButton
        textColor="white"
        backgroundColor="orange"
        css={(theme) => ({
          background: "rgb(248, 157, 53)",
          color: "#fff",
          marginRight: theme.spacing(2),
        })}
        notConnected="Connect MetaMask"
        unavailable="Install"
      />
    );
  }
  if (account !== signedAccount) {
    const requestSignature = () => {
      setSignature((prev) => ({ ...prev, signing: true }));

      ethereum
        .request({
          method: "personal_sign",
          params: ["Play Crypto battle", account],
        })
        .then((signature: string) => {
          console.log(signature);
          setSignature({
            account,
            expiry: Date.now() + 1000 * 60 * 60,
            signature,
            signing: false,
          });
        })
        .catch(() => setSignature((prev) => ({ ...prev, signing: false })));
    };

    return (
      <Button loading={signing} onClick={requestSignature}>
        {signing ? "signing" : "sign"}
      </Button>
    );
  }

  return <Button>Signed</Button>;
};

export default MetaMaskLogin;
