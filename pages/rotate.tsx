import { NextPage } from "next";
// import Layout from "../components/Layout";
import React, { useState, createRef } from "react";
import Bubble from "./Bubble";
import AnimateBubbles from "./AnimateBubbles";
import initialImages from "./initialImages";
// import shuffleArray from "./helpers/shuffleArray";
// import "./styles.css";


const shiftArray = (arr) => {
  return arr.concat(arr.splice(0, arr.indexOf(arr[1])));
};

// import ComposedGlobalLayout from "../components/_composed/GlobalLayout";

// import NFTInventory from "../components/NFTInventory";
// import NFTChoose from "../components/NFTChoose";

const Rotate: NextPage = () => {
  const [images, setImages] = useState(initialImages);

  const reorder = () => {
    const shuffledImages = shiftArray(images);
    setImages(shuffledImages);
  };

  return (
    <div>
      <div className="bubbles-wrapper">
        <div className="bubbles-group">
          <AnimateBubbles>
            {images.map(({ id, text }) => (
              <Bubble key={id} id={id} text={text} ref={createRef()} />
            ))}
          </AnimateBubbles>
        </div>
      </div>

      <div className="button-wrapper">
        <button className="button" onClick={reorder}>
          Re-order images
        </button>
      </div>
    </div>
  );
};

export default Rotate;
