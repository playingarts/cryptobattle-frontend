import { FC, HTMLAttributes, useEffect, useState, useCallback } from "react";

import { Modal, DialogClose } from "../Modal";
import Text from "../Text";
import { useAuth } from "../AuthProvider";
import { api } from "../../api";
import { logError } from "../../utils/errorHandler";
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

  const [firstCard, setFirstCard] = useState<any>(
    localStorage.getItem("chosen-nfts")
      // eslint-disable-next-line
  // @ts-ignore: Unreachable code error
      ? JSON.parse(localStorage.getItem("chosen-nfts"))[0]
      : null
  );
  // eslint-disable-next-line
  // @ts-ignore: Unreachable code error
  const [secondCard, setSecondCard] = useState<any>(
    localStorage.getItem("chosen-nfts")
      // eslint-disable-next-line
  // @ts-ignore: Unreachable code error
      ? JSON.parse(localStorage.getItem("chosen-nfts"))[1]
      : null
  );

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

    localStorage.setItem(
      "chosen-nfts",
      JSON.stringify([firstCard, secondCard])
    );

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
      .then((data: any) => {
        setLoading(false);

        const computedData = data.cards.map((card: any) => {
          const foundCard = getCard(card.suit, card.value, card);
          return { ...foundCard, ...card };
        });

        setNFTCards(computedData);
      })
      .catch((err: any) => {
        logError(err, 'NFTChoose');
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
    url: string;
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
      <div
        css={{
          display: "flex",
          pointerEvents: NFTCards.length === 0 ? "none" : "unset",
        }}
      >
        <div
          onClick={setFirstCardActive}
          css={{ display: "flex", marginRight: 10, width: "50%" }}
        >
          {!firstCard ? (
            <div css={{ display: "flex" }}>
              <CardEmpty isNftChoose={NFTCards.length !== 0} />
              <svg
                css={{ marginTop: 70, marginLeft: 20 }}
                width="130"
                height="130"
                viewBox="0 0 130 130"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="130" height="10" rx="5" fill="#242424" />
                <rect y="43" width="130" height="10" rx="5" fill="#242424" />
                <rect y="84" width="130" height="10" rx="5" fill="#242424" />
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
              <div css={{ marginTop: 40, marginLeft: 20 }}>
                <CardStats
                  css={{ minWidth: 130 }}
                  color="light"
                  xp={firstCard && firstCard.xp}
                  power={firstCard && firstCard.powerLevel}
                  scoring={firstCard && firstCard.scoringLevel}
                />
                <div
                  css={{
                    marginTop: 10,
                    display: "inline-flex",
                    fontSize: "13px",
                    fontWeight: "600",
                    lineHeight: "30px",
                    padding: "2px 15px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "10px",
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
              <CardEmpty isNftChoose={NFTCards.length !== 0} />
              <svg
                css={{ marginTop: 70, marginLeft: 20 }}
                width="130"
                height="130"
                viewBox="0 0 130 130"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="130" height="10" rx="5" fill="#242424" />
                <rect y="43" width="130" height="10" rx="5" fill="#242424" />
                <rect y="84" width="130" height="10" rx="5" fill="#242424" />
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
              <div css={{ marginTop: 40, marginLeft: 20 }}>
                <CardStats
                  css={{ minWidth: 130 }}
                  color="light"
                  xp={secondCard && secondCard.xp}
                  power={secondCard && secondCard.powerLevel}
                  scoring={secondCard && secondCard.scoringLevel}
                />
                <div
                  css={{
                    marginTop: 10,
                    display: "inline-flex",
                    fontSize: "13px",
                    fontWeight: "600",
                    lineHeight: "30px",
                    padding: "2px 15px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "10px",
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
      css={() => ({
        background: `#181818`,
        backgroundSize: "85%",
        color: "rgba(255, 255, 255, 0.5)",
        position: "relative",
        margin: "20px 0",
        padding: "40px",
      })}
    >
      {!user.isMetamaskConnected && (
        <div>
          <Text variant="body" css={{ opacity: 0.6, margin: "0 0 30px 0" }}>
            Connect your wallet to use Crypto Edition NFT cards in the game.
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
        <div>
          <Modal trigger={trigger()} title="Choose cards">
            {loading && (
              <Loader
                css={{
                  textAlign: "center",
                  alignSelf: "center",
                  marginLeft: 20,
                }}
              />
            )}

            {topCards && topCards.length > 0 && (
              <Text variant="h6" css={{ opacity: 0.5, marginTop: "40px" }}>
                Most Played Cards
              </Text>
            )}

            <div
              css={{
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {topCards &&
                topCards.length > 0 &&
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
                      maxWidth: 480,
                      // background: "#ccc",

                      pointerEvents:
                        firstCard?.id === card.id || secondCard?.id === card.id
                          ? "none"
                          : "unset",
                    }}
                    key={index}
                  >
                    <DialogClose asChild>
                      <div
                        css={{
                          display: "flex",
                          justifyContent: "start",
                          maxWidth: 180,
                        }}
                      >
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
                            {/* <Link
                              css={{
                                pointerEvents: "auto",
                                textDecoration: "none",
                                color: "#000",
                                opacity: 0.5,
                                transition: "all 500ms",
                                "&:hover": {
                                  opacity: 1,
                                },
                              }}
                              href={card.url}
                              target="_blank"
                            >
                              {card.artist}
                            </Link> */}
                          </div>
                        </div>
                        <div css={{ marginTop: 40, marginLeft: 20 }}>
                          <CardStats
                            css={{ marginBottom: 20 }}
                            color={"dark"}
                            xp={card.xp}
                            power={card.powerLevel}
                            scoring={card.scoringLevel}
                          />

                          {firstCard?.id === card.id ||
                          secondCard?.id === card.id ? (
                            <Button
                              css={{
                                fontSize: "13px",
                                lineHeight: "30px",
                                padding: "2px 15px",
                              }}
                              disabled={true}
                            >
                              Selected
                            </Button>
                          ) : (
                            <Button
                              css={{
                                color: "#fff",
                                background: "#7B61FF",
                                fontSize: "13px",
                                lineHeight: "30px",
                                padding: "2px 15px",
                              }}
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
                {topCards && topCards.length > 0 && (
                  <Line css={{ margin: "0 0 20px 0" }}></Line>
                )}

                <Text variant="h6" css={{ opacity: 0.5, marginTop: "40px" }}>
                  Your Inventory
                </Text>
                <div
                  css={{
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                >
                  {cardInventory
                    .filter((card: CardType) => !card.onSale)
                    .map((card: CardType) => (
                      <div
                        css={{
                          cursor: "pointer",
                          pointerEvents:
                            firstCard?.id === card.id ||
                            secondCard?.id === card.id
                              ? "none"
                              : "unset",
                          marginBottom: 50,
                        }}
                        onClick={
                          firstCard?.id === card.id ||
                          secondCard?.id === card.id
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
                              marginRight: 50,
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
                                marginTop: -10,
                              }}
                            >
                              {firstCard?.id === card.id ||
                              secondCard?.id === card.id ? (
                                <Button
                                  css={{
                                    fontSize: "13px",
                                    lineHeight: "30px",
                                    padding: "2px 15px",
                                  }}
                                  disabled={true}
                                >
                                  Selected
                                </Button>
                              ) : (
                                <Button
                                  css={{
                                    color: "#fff",
                                    fontSize: "13px",
                                    lineHeight: "30px",
                                    padding: "2px 15px",
                                    background: "#7B61FF",
                                  }}
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
          {/*
          <Line />
          <Text
            css={{
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.25)",
              fontSize: 15,
              marginBottom: 20,
              marginTop: 30,
            }}
          >
            You will be able to use these cards during the game.
          </Text>
          */} 
        </div>
      )}
    </StatBlock>
  );
};

export default NFTChoose;
