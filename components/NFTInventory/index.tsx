import { FC, HTMLAttributes, useEffect, useState } from "react";

import Line from "../Line";
import Text from "../Text";
import { useAuth } from "../AuthProvider";
import axios from "axios";
import Loader from "../Loader";
import MetamaskLogin from "../../components/MetamaskLogin/";
import Card from "../../components/CardNew";
import CardEmpty from "../../components/CardEmpty";
import MostPlayedCards from "./MostPlayedCards";

const getUserNftCards = () => {
  return axios.get(
    "https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/api/rest/user-nft-cards",

    {
      headers: {
        accesstoken: localStorage.getItem("accessToken"),
        "content-type": "application/json",
      },
    }
  );
};

export type Props = HTMLAttributes<HTMLDivElement>;

const NFTInventory: FC<Props> = ({ ...props }) => {
  const { user } = useAuth();

  const [NFTCards, setNFTCards] = useState<Array<CardType>>([]);

  interface CardType {
    id: string;
    uid: string;
    name: string;
    onSale: boolean;
    power: number;
    scoring: number;
    xp: number;
    suit: string;
    value: string;
    imageUrl: string;
  }

  const [loading, setLoading] = useState(false);
  const [topCards, setTopCards] = useState<Array<CardType>>([]);
  const [cardInventory, setCardInventory] = useState<Array<CardType>>([]);

  const [cardsOnSale, setCardsOnSale] = useState<Array<CardType>>([]);

  useEffect(() => {
    if (!user.isMetamaskConnected) {
      return;
    }
    setLoading(true);

    getUserNftCards()
      .then(({ data }) => {
        setLoading(false);
        setNFTCards(data.cards);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (NFTCards.length === 0) {
      return;
    }

    const filteredCards = NFTCards.filter((card) => card.onSale);

    const topCard = NFTCards.reduce((prev: CardType, current: CardType) =>
      prev.xp > current.xp ? prev : current
    );
    const secondCard = NFTCards.filter((card) => card.id !== topCard.id).reduce(
      (prev: CardType, current: CardType) =>
        prev.xp > current.xp ? prev : current
    );

    const inventory = NFTCards.filter(
      (card) => card.id !== topCard.id && card.id !== secondCard.id
    );
    setCardsOnSale(filteredCards);
    setCardInventory(inventory);

    setTopCards([topCard, secondCard]);
  }, [NFTCards]);

  if (Object.keys(user.metamask).length === 0) {
    return (
      <div>
        {" "}
        <Text component="h3" css={{ margin: 0 }}>
          NFT Inventory
        </Text>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text variant="body2" css={{ opacity: 0.6 }}>
            Connect wallet to use and level up NFT cards you are holding.
          </Text>
          <MetamaskLogin
            css={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#F89D35",
            }}
          ></MetamaskLogin>
        </div>
        <div css={{ display: "flex", justifyContent: "space-between" }}>
          {Array(5)
            .fill(0)
            .map((card, index) => (
              <CardEmpty
                isPlaceholder={true}
                key={index}
                css={{ marginRight: "20px", column: "span 3" }}
              ></CardEmpty>
            ))}
        </div>
      </div>
    );
  }
  return (
    <div
      {...props}
      css={(theme) => ({
        color: theme.colors.text_title_light,
        position: "relative",
        margin: "20px 0",
      })}
    >
      {/* // carousel */}
      <div
        css={{
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "left",
        }}
      >
        <Text
          component="h3"
          css={{ margin: 0, display: "flex", alignItems: "center" }}
        >
          <span>NFT Inventory</span>
        </Text>{" "}
        {loading && (
          <Loader
            {...props}
            css={{
              textAlign: "center",
              alignSelf: "center",
              marginLeft: 20,
            }}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text variant="h6" css={{ opacity: 0.6 }}>
          {user && user.metamask && user.metamask.address}
        </Text>
       {user && !user.isMetamaskConnected && 
        <MetamaskLogin
          css={{
            background: "rgba(255, 255, 255, 0.05)",
            color: "#F89D35",
          }}
        ></MetamaskLogin>}
      </div>
      <Line spacing={2}></Line>

      <MostPlayedCards color={"light"} topCards={topCards} />

      {loading && (
        <div
          css={{
            minHeight: 300,
          }}
        />
      )}

      {!loading && NFTCards.length === 0 && (
        <div
          css={{
            minHeight: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text variant="h3" css={{ opacity: 0.6 }}>
            No NFTs
          </Text>
        </div>
      )}

      {cardInventory.length > 0 && (
        <div style={{}}>
          <Line spacing={5}></Line>
          <Text variant="h6" css={{ opacity: 0.6, marginTop: 40 }}>
            Inventory
          </Text>

          <div
            css={{
              display: "grid",
              gridGap: 40,
              gridTemplateColumns: "repeat(auto-fill, 210px)",
            }}
          >
            {cardInventory.map((card, index) => (
              <Card
                key={index}
                css={{ marginRight: "20px", column: "span 3" }}
                animated={true}
                card={{ img: card.imageUrl }}
              ></Card>
            ))}
          </div>
        </div>
      )}

      {cardsOnSale.length > 0 && (
        <div style={{}}>
          <Line spacing={5}></Line>
          <Text variant="h6" css={{ opacity: 0.6, marginTop: 40 }}>
            Cards on sale (not playable)
          </Text>

          <div
            css={{
              display: "grid",
              gridGap: 40,
              gridTemplateColumns: "repeat(auto-fill, 210px)",
            }}
          >
            {cardsOnSale.map((card, index) => (
              <Card
                key={index}
                css={{ marginRight: "20px", column: "span 3" }}
                animated={true}
                card={{ img: card.imageUrl }}
              ></Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTInventory;
//  <Text variant="body2" css={{ opacity: 0.5 }}>
