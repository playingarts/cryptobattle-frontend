import React from "react";

const calculateBoundingBoxes = children => {
  const boundingBoxes = {};

  React.Children.forEach(children, child => {
    const domNode = child.ref.current;

    if (!domNode) {
      return
    }
    const nodeBoundingBox = domNode.getBoundingClientRect();

    boundingBoxes[child.key] = nodeBoundingBox;
  });

  return boundingBoxes;
};

export default calculateBoundingBoxes;
