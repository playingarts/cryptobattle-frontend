import { FC, Fragment, HTMLAttributes, useEffect, useState } from "react";

import Line from "../Line";
import Link from "../Link";

import Text from "../Text";
import { useAuth } from "../AuthProvider";
import { api } from "../../api";
import Loader from "../Loader";
import MetamaskLogin from "../../components/MetamaskLogin/";
import Card from "../../components/CardNew";
import CardEmpty from "../../components/CardEmpty";
import { getCard } from "../../components/Cards";
import CardStats from "../CardStats";
import BuyNFT from "../BuyNFT";
import Button from "../Button";

import Opensea from "../../components/Icons/Opensea";

const getUserNftCards = () => {
  return api.get("/api/rest/user-nft-cards");
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
    powerLevel: number;
    scoring: number;
    scoringLevel: number;
    xp: number;
    suit: string;
    url: string;
    value: string;
    imageUrl: string;
    artist: string;
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
      .then((data: any) => {
        const computedData = data.cards.map((card: any) => {
          const foundCard = getCard(card.suit, card.value, card);
          return { ...foundCard, ...card };
        });

        setLoading(false);
        setNFTCards(computedData);
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (NFTCards.length === 0) {
      return;
    }

    console.log(NFTCards);

    const cardsOnSale = NFTCards.filter((card) => card.onSale);

    const topCards = NFTCards.filter((card) => card.xp).sort(
      (a, b) => b.xp - a.xp
    );

    const inventory = NFTCards.filter((card) => !card.onSale && !card.xp);

    setCardsOnSale(cardsOnSale);
    setCardInventory(inventory);

    setTopCards(topCards);
  }, [NFTCards]);

  if (Object.keys(user.metamask).length === 0) {
    return (
      <div css={{ marginRight: 100, marginLeft: 100, marginTop: 50 }}>
        {" "}
        {/* <Text component="h3" css={{ margin: 0 }}>
          NFT Inventory
        </Text> */}
        <div
          style={{
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <Text variant="body2" css={{ opacity: 0.6 }}>
            Connect your wallet to use Crypto EditionNFT cards in the game.
          </Text>
          <MetamaskLogin
            css={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#F89D35",
            }}
          ></MetamaskLogin>
        </div>
        <div
          css={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 150,
          }}
        >
          {Array(4)
            .fill(0)
            .map((card, index) => (
              <div key={index}>
                <CardEmpty
                  isPlaceholder={true}
                  css={{
                    marginRight: "30px",
                    pointerEvents: "none",
                    background: `#181818`,
                  }}
                ></CardEmpty>
                <div
                  css={{
                    width: "100px",
                    background: `#181818`,
                    marginTop: 20,
                    borderRadius: 40,
                    height: 15,
                    marginRight: "auto",
                    marginLeft: "auto",
                  }}
                ></div>
              </div>
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
        margin: "0px 0",
        padding: "10px 50px",
      })}
    >
      {/* <div
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
      </div> */}

      {/* <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text variant="h6" css={{ opacity: 0.6 }}>
          {user && user.metamask && user.metamask.address}
        </Text>
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
        {user && !user.isMetamaskConnected && (
          <MetamaskLogin
            css={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#F89D35",
            }}
          ></MetamaskLogin>
        )}
      </div> */}

      <Line spacing={2} css={{ margin: "30px auto 0" }}></Line>

      {topCards.length > 0 && (
        <Text
          variant="h6"
          css={{
            color: "rgba(255, 255, 255, 0.3)",
            marginTop: 30,
            marginBottom: 30,
          }}
        >
          Most played cards{" "}
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
        </Text>
      )}
      <div
        css={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {topCards &&
          topCards.map((card, index) => (
            <div
              style={{
                width: 440,
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
              key={index}
            >
              <div>
                <Card
                  css={{
                    marginRight: "0px",
                    width: 230,
                    boxShadow: "none",
                    marginBottom: 20,
                    transform: "scale(1, 1)",
                    transformOrigin: "0 0",
                  }}
                  noShadow={true}
                  animated={false}
                  card={{ img: card.imageUrl }}
                ></Card>
                <div
                  css={{
                    marginBottom: 50,
                    marginTop: 6,
                    maxWidth: 210,
                    marginLeft: 0,
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <a
                    css={{
                      pointerEvents: "auto",
                      textDecoration: "none",
                      transition: "all 300ms",
                      color: "rgba(255, 255, 255, 0.3)",
                      "&:hover": {
                        color: "rgba(255, 255, 255, 0.9)",
                      },
                    }}
                    href={card.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {card.artist}
                  </a>
                </div>
              </div>
              <div css={{ marginTop: -70, marginLeft: 20 }}>
                <CardStats
                  color={"light"}
                  xp={card.xp}
                  power={card.powerLevel}
                  scoring={card.scoringLevel}
                />
              </div>
            </div>
          ))}
      </div>

      {loading && (
        <div
          css={{
            minHeight: 300,
          }}
        />
      )}

      {!loading && NFTCards.length === 0 && (
        <Fragment>
          <Text
            component="p"
            css={{
              fontSize: 20,
              maxWidth: "920px",
              margin: "30px auto",
              padding: "30px 50px 0",
              color: "rgba(255, 255, 255, 0.3)",
            }}
          >
            Looks like there are no Crypto Edition NFT cards in your wallet.
          </Text>

          <div
            css={{
              display: "flex",
              margin: "30px auto",
              padding: "0px 50px",
              maxWidth: "920px",
            }}
          >
            <Link
              target="_blank"
              href="https://opensea.io/collection/cryptoedition"
            >
              <Button
                Icon={Opensea}
                css={(theme) => ({
                  background: "rgba(255, 255, 255, 0.05)",
                  marginRight: theme.spacing(1),
                  color: "#407FDB",
                })}
              >
                Buy NFT
              </Button>
            </Link>
          </div>
        </Fragment>
      )}

      {cardInventory.length > 0 && (
        <div style={{}}>
          {topCards.length > 0 && <Line spacing={2}></Line>}
          <Text
            variant="h6"
            css={{
              color: "rgba(255, 255, 255, 0.3)",
              marginTop: 30,
              marginBottom: 30,
            }}
          >
            Your Inventory
          </Text>

          <div
            css={{
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {cardInventory.map((card, index) => (
              <div key={index}>
                <Card
                  css={{
                    marginRight: "50px",
                    pointerEvents: "none",
                  }}
                  animated={true}
                  card={{ img: card.imageUrl }}
                ></Card>
                <div
                  css={{
                    marginBottom: 50,
                    marginTop: 20,
                    width: 210,
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <Link
                    css={{
                      pointerEvents: "auto",
                      textDecoration: "none",
                      color: "rgba(255, 255, 255, 0.3)",
                      transition: "all 500ms",
                      "&:hover": {
                        color: "rgba(255, 255, 255, 0.8)",
                      },
                    }}
                    href={card.url}
                    target="_blank"
                  >
                    {card.artist}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {cardsOnSale.length > 0 && (
        <div style={{}}>
          <Line spacing={3}></Line>
          <Text variant="h6" css={{ opacity: 0.6, marginBottom: 40 }}>
            Cards on sale (not playable)
          </Text>

          <div
            css={{
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {cardsOnSale.map((card, index) => (
              <div key={index}>
                <Card
                  css={{ marginRight: "50px", pointerEvents: "none" }}
                  animated={true}
                  card={{ img: card.imageUrl }}
                ></Card>
                <div
                  css={{
                    marginBottom: 50,
                    marginTop: 15,
                    maxWidth: 210,
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <Link
                    css={{
                      pointerEvents: "auto",
                      textDecoration: "none",
                      color: "rgba(255, 255, 255, 0.9)",
                      transition: "all 500ms",
                      "&:hover": {
                        color: "rgba(255, 255, 255, 0.8)",
                      },
                    }}
                    href={card.url}
                    target="_blank"
                  >
                    {card.artist}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {NFTCards.length > 0 && <BuyNFT />}
    </div>
  );
};

export default NFTInventory;
