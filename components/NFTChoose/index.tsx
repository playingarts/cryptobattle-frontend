import { FC, HTMLAttributes, useEffect, useState, useCallback } from "react";

import { Modal, DialogClose } from "../Modal";
import Text from "../Text";
import { useAuth } from "../AuthProvider";
import axios from "axios";
import Line from "../Line";
// import Loader from "../Loader";

import MetamaskLogin from "../MetamaskLogin/";
import StatBlock from "../../components/StatBlock";
import Card from "../CardNew";
// import Button from "../Button";
import CardEmpty from "../../components/CardEmpty";
import CardStats from "../../components/CardStats";
import Loader from "../Loader";

import MostPlayedCards from "../../components/NFTInventory/MostPlayedCards";

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

const NFTChoose: FC<Props> = () => {
  // const [NFTCards, setNFTCards] = useState([]);

  const { user } = useAuth();

  const [firstCard, setFirstCard] = useState<CardType>();
  const [secondCard, setSecondCard] = useState<CardType>();

  const [activeCard, setActiveCard] = useState(0);

  const [loading, setLoading] = useState(false);
  const [topCards, setTopCards] = useState<Array<CardType>>([]);

  const setFirstCardActive = () => {
    setActiveCard(1);
  };
  const setSecondCardActive = () => {
    setActiveCard(2);
  };

  const addCard = useCallback(
    (card: CardType) => () => {
      if (activeCard === 1) {
        setFirstCard(card);
      }

      if (activeCard === 2) {
        setSecondCard(card);
      }
    },
    [setFirstCard, setSecondCard, activeCard]
  );

  useEffect(() => {
    if (!user.isMetamaskConnected) {
      return;
    }
    setLoading(true);

    getUserNftCards().then(({ data }) => {
      setLoading(false);
      setNFTCards(data.cards);
    });
  }, [user]);

  const [NFTCards, setNFTCards] = useState<Array<CardType>>([]);

  interface CardType {
    id: string;
    name: string;
    onSale: boolean;
    power: number;
    scoring: number;
    xp: number;
    suit: string;
    value: string;
    imageUrl: string;
  }

  const [cardInventory, setCardInventory] = useState<Array<CardType>>([]);

  useEffect(() => {
    if (NFTCards.length === 0) {
      return;
    }

    const topCard = NFTCards.reduce((prev: CardType, current: CardType) =>
      prev.xp > current.xp ? prev : current
    );
    const secondCard = NFTCards.filter(
      (card) => card.id !== topCard.id
    ).reduce((prev: CardType, current: CardType) =>
      prev.xp > current.xp ? prev : current
    );

    const inventory = NFTCards.filter(
      (card) =>
        card.id !== topCard.id && card.id !== secondCard.id && !card.onSale
    );

    setCardInventory(inventory);

    setTopCards([topCard, secondCard]);
  }, [NFTCards]);

  setFirstCardActive;
  setSecondCardActive;

  const trigger = () => {
    return (
      <div css={{ display: "flex" }}>
        <div onClick={setFirstCardActive} css={{ display: "flex" }}>
          {!firstCard ? (
            <div css={{ minWidth: 400 }}>
              <CardEmpty />
            </div>
          ) : (
            <div css={{ display: "flex", marginRight: 30 }}>
              <Card
                key={firstCard.id}
                css={{
                  marginRight: "20px",
                  column: "span 3",
                  cursor: "pointer",
                }}
                animated={false}
                card={{ img: firstCard.imageUrl }}
              ></Card>
              <CardStats
                color="light"
                xp={firstCard && firstCard.xp}
                power={firstCard && firstCard.power}
                scoring={firstCard && firstCard.scoring}
              />
            </div>
          )}
        </div>
        <div onClick={setSecondCardActive} css={{ display: "flex" }}>
          {!secondCard ? (
            <div css={{ minWidth: 400 }}>
              <CardEmpty />
            </div>
          ) : (
            <div css={{ display: "flex" }}>
              <Card
                key={secondCard.id}
                css={{
                  marginRight: "20px",
                  column: "span 3",
                  cursor: "pointer",
                }}
                animated={false}
                card={{ img: secondCard.imageUrl }}
              ></Card>
              <CardStats
                color="light"
                xp={secondCard && secondCard.xp}
                power={secondCard && secondCard.power}
                scoring={secondCard && secondCard.scoring}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <StatBlock
      title={"Choose up to 2 NFTS (optional"}
      css={(theme) => ({
        background: `#181818`,
        backgroundSize: "85%",
        color: theme.colors.text_title_light,
        position: "relative",
        margin: "20px 0",
      })}
    >
      {!user.isMetamaskConnected && (
        <div>
          <Text variant="body" css={{ opacity: 0.6 }}>
            Connect wallet to use and level up NFT cards you are holding.
          </Text>
          <MetamaskLogin
            css={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#F89D35",
            }}
          ></MetamaskLogin>
        </div>
      )}

      {user.isMetamaskConnected && (
        <Modal
          trigger={trigger()}
          description="Share your game link, wait for players to connect and click “Start”!
        Choose the NFTs you want to level up (optional)."
          title="Choose your NFTs"
        >
          {loading && (
            <Loader
              css={{
                textAlign: "center",
                alignSelf: "center",
                marginLeft: 20,
              }}
            />
          )}

          <Text variant="h6">Most Played</Text>

          <DialogClose asChild>
            <MostPlayedCards
              color="dark"
              addCard={addCard}
              topCards={topCards}
            />
          </DialogClose>

          {cardInventory.length !== 0 && (
            <div>
              <Line></Line>

              <Text variant="h6">Inventory</Text>
              <div
                css={{
                  display: "grid",
                  gridGap: 30,
                  gridTemplateColumns: "repeat(auto-fill, 180px)",
                }}
              >
                {cardInventory
                  .filter((card: CardType) => !card.onSale)
                  .map((card: CardType) => (
                    <div onClick={addCard(card)} key={card.id}>
                      <DialogClose asChild>
                        <Card
                          css={{
                            marginRight: "20px",
                            column: "span 3",
                            maxWidth: "180px",
                            cursor: "pointer",
                            background: "#fff",
                            height: "224px",
                          }}
                          animated={false}
                          card={{ img: card.imageUrl }}
                        ></Card>
                      </DialogClose>
                    </div>
                  ))}{" "}
              </div>
            </div>
          )}
        </Modal>
      )}
    </StatBlock>
  );
};

export default NFTChoose;
