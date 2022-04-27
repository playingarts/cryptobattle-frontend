import { useMetaMask } from "metamask-react";
import { FC, useEffect, useState } from "react";
import Button from "../Button";
import store from "store";

const MetaMaskLogin: FC = () => {
  const {  ethereum, account, connect } = useMetaMask();
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


  if (account !== signedAccount) {

    const requestSignature = async () => {
      setSignature((prev) => ({ ...prev, signing: true }));

      const address: string= (await ethereum.enable())[0];
      connect()
      console.log(account);
      ethereum
        .request({
          method: "personal_sign",
          params: ["Play Crypto battle", address],
        })
        .then((signature: string) => {
          console.log(signature);
          setSignature({
            account: address,
            expiry: Date.now() + 1000 * 60 * 60,
            signature,
            signing: false,
          });
        })
        .catch(() => setSignature((prev) => ({ ...prev, signing: false })));
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
        {signing ? "signing" : "sign with metamask"}
      </Button>
    );
  }

  // router.push('/dashboard')

  return <Button>Logged in</Button>;
};

export default MetaMaskLogin;
