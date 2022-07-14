import { FC, HTMLAttributes, useEffect, useState } from "react";

import Line from "../Line";
import Text from "../Text";
import { useAuth } from "../AuthProvider";
import { api } from "../../api";
import Loader from "../Loader";
import MetamaskLogin from "../../components/MetamaskLogin/";
import Card from "../../components/CardNew";
import CardEmpty from "../../components/CardEmpty";
import { getCard } from "../../components/Cards";
import CardStats from "../CardStats";

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
    scoring: number;
    scoringLevel: number
    xp: number;
    suit: string;
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
      .then((data2: any) => {
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
            id: "7071114",
            name: "5 of Spades",
            onSale: true,
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
            id: "4512312321312",
            name: "7 of Hearts",
            onSale: true,
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
                css={{ marginRight: "20px", pointerEvents: 'none' }}
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
        padding: "20px 78px",
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
        {user && !user.isMetamaskConnected && (
          <MetamaskLogin
            css={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#F89D35",
            }}
          ></MetamaskLogin>
        )}
      </div>
      <Line spacing={2}></Line>


          <Text variant="h6" css={{ opacity: 0.6, marginBottom: 40 }}>
            Most played cards
          </Text>
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
                width: "50%",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none"
              }}
              key={index}
            >
              <div>
                <Card
                  css={{
                    marginRight: "0px",
                    width: 300,
                    boxShadow: 'none',
                    marginBottom: 120,
                    transform: 'scale(1.3, 1.3)',
                    transformOrigin: "0 0",
                  }}
                  noShadow={true}
                  animated={false}
                  card={{ img: card.imageUrl }}
                ></Card>
                <div
                  css={{
                    marginBottom: 70,
                    marginTop: 6,
                    maxWidth:   280,
     
                    marginLeft: 0,
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {card.artist }
                </div>
              </div>
              <div css={{marginLeft: 20, marginTop: -100}}>
                <CardStats
                  color={"light"}
                  xp={card.xp}
                  power={card.power}
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
          <Line spacing={2}></Line>
          <Text variant="h6" css={{ opacity: 0.6, marginBottom: 40 }}>
            Inventory
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
                  css={{ marginRight: "50px", pointerEvents: 'none' }}
                  animated={true}
                  card={{ img: card.imageUrl }}
                ></Card>
                <div
                  css={{
                    marginBottom: 50,
                    marginTop: 20,
                    maxWidth: 210,
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {card.artist}
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
          css={{ marginRight: "50px", pointerEvents: 'none' }}
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
          {card.artist}
        </div>
      </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTInventory;
