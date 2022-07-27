import { FC, HTMLAttributes } from "react";

import Text from "../Text";
// import Line from "../Line";

export type Props = HTMLAttributes<HTMLDivElement>;

const GameRulesDetails: FC<Props> = ({ ...props }) => {
  return (
    <div {...props}>

 
<Text
        variant="h2"
        css={{ fontSize: "30px", color: "#000", marginBottom: 40 }}
      >Details</Text>
        <div css={{width: 800, height: 300}}>

        </div>
    </div>
  );
};

export default GameRulesDetails;
