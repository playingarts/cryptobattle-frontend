import { FC, HTMLAttributes } from "react";
import Link from "../Link";
import Discord from "../Icons/Discord";
import Youtube from "../Icons/Youtube";
import Pinterest from "../Icons/Pinterest";
import Text from "../Text";
import Button from "../Button";

import Twitter from "../Icons/Twitter";
import { socialLinks } from "../../source/consts";
import Instagram from "../Icons/Instagram";
import Facebook from "../Icons/Facebook";
import Behance from "../Icons/Behance";

const Footer: FC<HTMLAttributes<HTMLDivElement>> = (props) => (
  <div
    {...props}
    css={() => ({
      color: "#fff",
      backgroundColor: "transparent",
    })}
  >
    {/* <Line spacing={2}></Line> */}
    <div
      css={(theme) => ({
        opacity: 0.3,
        color: theme.colors.text_subtitle_light,
      })}
    >
      <Text variant="h6" component="h2" css={{ margin: "0 0 10px 0" }}>
        © playing arts project
      </Text>
      {/* <Text variant="body0">
          All rights reserved. Any artwork displayed on this website may not be
          reproduced or used in any manner whatsoever without the express
          written permission of Digital Abstracts or their respective owners.
        </Text> */}
      {/*<Text
          variant="body0"
          css={{
            marginBottom: 0,
            display: "none",
          }}
        >
          © 2012—2022 Digital Abstracts SL
        </Text>
        */}
    </div>
    {/* <Line vertical={true} spacing={0} /> */}
    <nav
      css={(theme) => ({
        display: "none",
        flexWrap: "wrap",
        gridColumn: "span 6",
        color: theme.colors.text_subtitle_light,
        opacity: 0.5,
        justifyContent: "end",
      })}
    >
      {[
        {
          Icon: Twitter,
          href: socialLinks.twitter,
        },
        {
          Icon: Instagram,
          href: socialLinks.instagram,
        },
        {
          Icon: Facebook,
          href: socialLinks.facebook,
        },
        {
          Icon: Behance,
          href: socialLinks.behance,
        },
        {
          Icon: Youtube,
          href: socialLinks.youtube,
        },
        {
          Icon: Pinterest,
          href: socialLinks.pinterest,
        },
        {
          Icon: Discord,
          href: socialLinks.discord,
        },
      ].map(({ Icon, href }) => (
        <Button
          key={href}
          component={Link}
          target="_blank"
          href={href}
          Icon={Icon}
        />
      ))}
    </nav>
  </div>
);

export default Footer;
