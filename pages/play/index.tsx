import { NextPage } from "next";
import Layout from "../../components/Layout";
// import Grid from "../../components/Grid";
// import Text from "../../components/Text";
import GameLayout from "../../components/GameLayout";
import GameBoard from "../../components/GameBoard";
import GameInventory from "../../components/GameInventory";
import { useState } from "react";
const Play: NextPage = () => {
  const [selectedCard, setSelectedCard] = useState('');

  return (
    <GameLayout>
      <Layout
        css={(theme) => ({
          background: theme.colors.dark_gray,
          color: theme.colors.text_title_light,
          backgroundColor: "#0A0A0A",
          backgroundSize: "cover",
          minHeight: "100vh",
        })}
      >

        <GameBoard
          selectedCard={selectedCard}
        ></GameBoard>
  
      </Layout>
      <GameInventory
        onChange={(selectedCard) => setSelectedCard(selectedCard)}
      ></GameInventory>
    </GameLayout>
  );
};

export default Play;
