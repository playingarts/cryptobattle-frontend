import { FC, HTMLAttributes } from "react";

const CloseMenu: FC<HTMLAttributes<SVGElement>> = (props) => (
  <svg
    width="23"
    height="24"
    viewBox="0 0 23 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <line
      x1="1.55948"
      y1="1.85474"
      x2="21.3585"
      y2="21.6537"
      stroke="#7F7F7F"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="21.3588"
      y1="2.34659"
      x2="1.55977"
      y2="22.1456"
      stroke="#7F7F7F"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default CloseMenu;
