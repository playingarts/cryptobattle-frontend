import { FC, HTMLAttributes, useEffect, useState, useCallback } from "react";

import { Modal, DialogClose } from "../Modal";
import Text from "../Text";
import { useAuth } from "../AuthProvider";
import { api } from "../../api";
import Line from "../Line";
import { getCard } from "../../components/Cards";

// import Loader from "../Loader";
import { useWS } from "../../components/WsProvider/index";

import MetamaskLogin from "../MetamaskLogin/";
import StatBlock from "../../components/StatBlock";
import Card from "../CardNew";
import CardEmpty from "./CardEmpty";
import CardStats from "../../components/CardStats";
import Loader from "../Loader";

import Button from "../Button";

const getUserNftCards = () => {
  return api.get(`api/rest/user-nft-cards`);
};

export type Props = HTMLAttributes<HTMLDivElement>;

const NFTChoose: FC<Props> = () => {
  // const [NFTCards, setNFTCards] = useState([]);
  const WSProvider = useWS();

  const { user } = useAuth();

  const [firstCard, setFirstCard] = useState<any>();
  const [secondCard, setSecondCard] = useState<any>();

  const [activeCard, setActiveCard] = useState(0);

  const [loading, setLoading] = useState(false);
  const [topCards, setTopCards] = useState<Array<any>>([]);
  const [NFTCards, setNFTCards] = useState<Array<CardType>>([]);

  const setFirstCardActive = () => {
    setActiveCard(1);
  };
  const setSecondCardActive = () => {
    setActiveCard(2);
  };

  const addCard = useCallback(
    (card: CardType | null) => () => {
      if (!card) {
        return;
      }
      if (activeCard === 1) {
        setFirstCard(card);
      }

      if (activeCard === 2) {
        setSecondCard(card);
      }
    },
    [setFirstCard, setSecondCard, activeCard]
  );

  const clearCard = useCallback(
    (cardId: string) => () => {
      console.log(firstCard?.id === cardId);
      if (firstCard?.id === cardId) {
        setFirstCard(null);
      }

      if (secondCard?.id === cardId) {
        setSecondCard(null);
      }
    },
    [setFirstCard, setSecondCard, firstCard, secondCard]
  );

  useEffect(() => {
    if (!firstCard && !secondCard) {
      return;
    }

    const data = [];

    if (firstCard) {
      data.push({
        id: firstCard.id,
      });
    }

    if (secondCard) {
      data.push({
        id: secondCard.id,
      });
    }

    WSProvider.send(
      JSON.stringify({
        event: "choose-nft-cards",
        data: {
          cards: data,
        },
      })
    );
  }, [firstCard, secondCard, WSProvider]);

  useEffect(() => {
    if (!user.isMetamaskConnected) {
      return;
    }
    setLoading(true);

    getUserNftCards()
      .then((data2: any) => {
        setLoading(false);
        const data = [
          {
            id: "7074",
            name: "5 of Spades",
            onSale: false,
            power: 4,
            scoring: 4,
            xp: 0,
            suit: "spades",
            value: "5",
            imageUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/5-s-gd8kN968.jpg",
            videoUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/5-s-gd8kN968.mp4",
            powerLevel: 1,
            scoringLevel: 1,
          },
          {
            id: "45",
            name: "7 of Hearts",
            onSale: false,
            power: 4,
            scoring: 24,
            xp: 2,
            suit: "hearts",
            value: "7",
            imageUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.jpg",
            videoUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.mp4",
            powerLevel: 1,
            scoringLevel: 2,
          },
          {
            id: "43",
            name: "9 of Hearts",
            onSale: false,
            power: 4,
            scoring: 24,
            xp: 10,
            suit: "hearts",
            value: "7",
            imageUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.jpg",
            videoUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.mp4",
            powerLevel: 1,
            scoringLevel: 2,
          },
          {
            id: "41",
            name: "7 of Hearts",
            onSale: false,
            power: 4,
            scoring: 24,
            xp: 22,
            suit: "hearts",
            value: "7",
            imageUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.jpg",
            videoUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.mp4",
            powerLevel: 1,
            scoringLevel: 2,
          },
          {
            id: "49",
            name: "7 of Hearts",
            onSale: false,
            power: 4,
            scoring: 24,
            xp: 0,
            suit: "hearts",
            value: "7",
            imageUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.jpg",
            videoUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.mp4",
            powerLevel: 1,
            scoringLevel: 2,
          },
          {
            id: "3333",
            name: "7 of Hearts",
            onSale: false,
            power: 4,
            scoring: 24,
            xp: 0,
            suit: "hearts",
            value: "7",
            imageUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.jpg",
            videoUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.mp4",
            powerLevel: 1,
            scoringLevel: 2,
          },
          {
            id: "33233",
            name: "7 of Hearts",
            onSale: false,
            power: 4,
            scoring: 24,
            xp: 0,
            suit: "hearts",
            value: "7",
            imageUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.jpg",
            videoUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.mp4",
            powerLevel: 1,
            scoringLevel: 2,
          },
          {
            id: "32133",
            name: "7 of Hearts",
            onSale: false,
            power: 4,
            scoring: 24,
            xp: 0,
            suit: "hearts",
            value: "7",
            imageUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.jpg",
            videoUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.mp4",
            powerLevel: 1,
            scoringLevel: 2,
          },
          {
            id: "336633",
            name: "7 of Hearts",
            onSale: false,
            power: 4,
            scoring: 24,
            xp: 0,
            suit: "hearts",
            value: "7",
            imageUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.jpg",
            videoUrl:
              "https://s3.amazonaws.com/img.playingarts.com/crypto/cards/7-h-XW4Qx464.mp4",
            powerLevel: 1,
            scoringLevel: 2,
          },
        ];

        const computedData = data.map((card) => {
          const foundCard = getCard(card.suit, card.value, card);
          return { ...foundCard, ...card };
        });

        console.log("computedData", computedData);

        setNFTCards(computedData);
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  }, [user]);

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
    artist: string;
  }

  const [cardInventory, setCardInventory] = useState<Array<CardType>>([]);

  useEffect(() => {
    if (NFTCards.length === 0) {
      return;
    }

    const topCards = NFTCards.filter((card) => card.xp).sort(
      (a, b) => b.xp - a.xp
    );

    const inventory = NFTCards.filter((card) => !card.onSale && !card.xp);

    setCardInventory(inventory);

    setTopCards(topCards);
  }, [NFTCards]);

  setFirstCardActive;
  setSecondCardActive;

  const trigger = () => {
    return (
      <div css={{ display: "flex" }}>
        <div onClick={setFirstCardActive} css={{ display: "flex", marginRight: 20}}>
          {!firstCard ? (
            <div css={{ display: "flex" }}>
              <CardEmpty isNftChoose={true} />
              <svg
                css={{ marginTop: 70 }}
                width="140"
                height="86"
                viewBox="0 0 140 86"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="140"
                  height="10"
                  rx="5"
                  fill="white"
                  fillOpacity="0.05"
                />
                <rect
                  y="38"
                  width="140"
                  height="10"
                  rx="5"
                  fill="white"
                  fillOpacity="0.05"
                />
                <rect
                  y="76"
                  width="140"
                  height="10"
                  rx="5"
                  fill="white"
                  fillOpacity="0.05"
                />
              </svg>
            </div>
          ) : (
            <div
              css={{
                display: "flex",
                marginRight: 10,
                justifyContent: "flex-start",
              }}
            >
              <Card
                key={firstCard.id}
                css={{
                  transform: "scale(0.9,0.9)",
                  transformOrigin: "0 0",
                  marginRight: "0px",
                  cursor: "pointer",
                }}
                animated={false}
                card={{ img: firstCard.imageUrl }}
              ></Card>
              <div css={{ marginTop: 40}}>
                <CardStats
                css={{minWidth: 130}}
                  color="light"
                  xp={firstCard && firstCard.xp}
                  power={firstCard && firstCard.power}
                  scoring={firstCard && firstCard.scoringLevel}
                />
                <div
                  css={{
                    marginTop: 30,
                    fontSize: 16,
                    fontWeight: "bold",
                    transition: "color 300ms",
                    cursor: "pointer",
                    "&:hover": {
                      color: "#FE5621",
                    },
                  }}
                  onClick={(e) => {
                    setFirstCard(null);
                    e.stopPropagation();
                  }}
                >
                  {" "}
                  REMOVE{" "}
                </div>
              </div>
            </div>
          )}
        </div>
        <div onClick={setSecondCardActive} css={{ display: "flex" }}>
          {!secondCard ? (
            <div css={{ minWidth: 360, display: "flex" }}>
              <CardEmpty isNftChoose={true} />
              <svg
                css={{ marginTop: 70 }}
                width="140"
                height="86"
                viewBox="0 0 140 86"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="140"
                  height="10"
                  rx="5"
                  fill="white"
                  fillOpacity="0.05"
                />
                <rect
                  y="38"
                  width="140"
                  height="10"
                  rx="5"
                  fill="white"
                  fillOpacity="0.05"
                />
                <rect
                  y="76"
                  width="140"
                  height="10"
                  rx="5"
                  fill="white"
                  fillOpacity="0.05"
                />
              </svg>
            </div>
          ) : (
            <div css={{ display: "flex" }}>
              <Card
                key={secondCard.id}
                css={{
                  transform: "scale(0.9,0.9)",
                  transformOrigin: "0 0",

                  marginRight: "0px",
                  cursor: "pointer",
                }}
                animated={false}
                card={{ img: secondCard.imageUrl }}
              ></Card>
              <div css={{ marginTop: 40 }}>
                <CardStats
                css={{minWidth: 130}}
                  color="light"
                  xp={secondCard && secondCard.xp}
                  power={secondCard && secondCard.power}
                  scoring={secondCard && secondCard.scoringLevel}
                />
                <div
                  css={{
                    marginTop: 30,
                    fontSize: 16,
                    fontWeight: "bold",
                    transition: "color 300ms",
                    cursor: "pointer",
                    "&:hover": {
                      color: "#FE5621",
                    },
                  }}
                  onClick={(e) => {
                    setSecondCard(null);
                    e.stopPropagation();
                  }}
                >
                  {" "}
                  REMOVE{" "}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <StatBlock
      title={"Choose up to 2 NFTS (optional)"}
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

          <div
            css={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            {topCards &&
              topCards.map((card, index) => (
                <div
                  onClick={
                    firstCard?.id === card.id || secondCard?.id === card.id
                      ? addCard(null)
                      : addCard(card)
                  }
                  css={{ cursor: "pointer" }}
                  style={{
                    width: "50%",
                    display: "flex",
                    alignItems: "center",
                    maxWidth: 400,

                    pointerEvents:
                      firstCard?.id === card.id || secondCard?.id === card.id
                        ? "none"
                        : "unset",
                  }}
                  key={index}
                >
                  <DialogClose asChild>
                    <div css={{ display: "flex", justifyContent: "start", maxWidth: 180 }}>
                      <div>
                        <Card
                          css={{
                            marginRight: "0px",
                            marginBottom: 0,
                            transform: "scale(0.9, 0.9)",
                            transformOrigin: "0 0",
                          }}
                          animated={false}
                          card={{ img: card.imageUrl }}
                        ></Card>
                        <div
                          css={{
                            marginBottom: 30,
                            maxWidth: 190,
                            textAlign: "center",
                            color: "rgba(0, 0, 0, 0.5)",
                          }}
                        >
                          {card.artist}
                        </div>
                      </div>
                      <div css={{ marginLeft: 20 }}>
                        <CardStats
                          css={{ marginBottom: 20 }}
                          color={"dark"}
                          xp={card.xp}
                          power={card.power}
                          scoring={card.scoringLevel}
                        />

                        {firstCard?.id === card.id ||
                        secondCard?.id === card.id ? (
                          <Button disabled={true}>Selected</Button>
                        ) : (
                          <Button
                            css={{ color: "#fff", background: "#7B61FF" }}
                          >
                            Select
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogClose>
                </div>
              ))}
          </div>

          {cardInventory.length !== 0 && (
            <div>
              <Line css={{ margin: "50px 0 10px 0" }}></Line>

              <Text variant="h6">Never Played</Text>
              <div
                css={{
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                {cardInventory
                  .filter((card: CardType) => !card.onSale)
                  .map((card: CardType, index: number) => (
                    <div
                      css={{
                        cursor: "pointer",
                        pointerEvents:
                          firstCard?.id === card.id ||
                          secondCard?.id === card.id
                            ? "none"
                            : "unset",
                        marginBottom: 40,
                      }}
                      onClick={
                        firstCard?.id === card.id || secondCard?.id === card.id
                          ? addCard(null)
                          : addCard(card)
                      }
                      key={card.id}
                    >
                      <DialogClose asChild>
                        <div
                          css={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            maxWidth: 190,
                            marginRight: 12
                          }}
                        >
                          <Card
                            css={{
                              marginRight: "20px",
                              cursor: "pointer",
                              marginBottom: "0px",
                              background: "#fff",
                              pointerEvents:
                                firstCard?.id === card.id ||
                                secondCard?.id === card.id
                                  ? "none"
                                  : "unset",
                              transform: "scale(0.9, 0.9)",
                              transformOrigin: "0 0",
                            }}
                            animated={false}
                            card={{ img: card.imageUrl }}
                          ></Card>
                          <div
                            css={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <div
                              css={{
                                marginBottom: 15,
                                color: "rgba(0, 0, 0, 0.5)",
                              }}
                            >
                              {" "}
                              {card.artist}
                            </div>

                            {firstCard?.id === card.id ||
                            secondCard?.id === card.id ? (
                              <Button disabled={true}>Selected</Button>
                            ) : (
                              <Button
                                css={{ color: "#fff", background: "#7B61FF" }}
                              >
                                Select
                              </Button>
                            )}
                          </div>
                        </div>
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
