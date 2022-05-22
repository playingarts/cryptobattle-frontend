import { FC, Fragment } from "react";
import Button from "../Button";
import Line from "../Line";
import Text from "../Text";
import Opensea from "../../components/Icons/Opensea";
import Looksrare from "../../components/Icons/Looksrare";

const PromoSection: FC = () => {
  return (
    <Fragment>
      <Line spacing={3} />

      <Text component="p" css={{ margin: 0, marginTop: "px", opacity: 0.5 }}>
        Playing Arts Crypto Edition (PACE) is a deck of playing cards featuring
        works of 55 leading artists.
        <br className="hidden md:block" /> Unique digital art collectibles
        living on the Ethereum blockchain.
      </Text>

      <div css={{ display: "flex", marginTop: "40px" }}>
        <Button
          Icon={Opensea}
          css={(theme) => ({
            background: "rgba(255, 255, 255, 0.05)",
            marginRight: theme.spacing(1),
            color: "#407FDB",
          })}
        >
          Opensea
        </Button>
        <Button
          css={(theme) => ({
            background: "rgba(255, 255, 255, 0.05)",
            marginRight: theme.spacing(1),
            color: "#04CD58 ",
          })}
          Icon={Looksrare}
        >
          Looksrare
        </Button>
      </div>


      {/* <Button
          icon={OpenseaIcon}
          text='OPENSEA'
          color='#407FDB'
          className='mr-4'
        />{' '}
        <Button color='#04CD58' icon={LooksrareIcon} text='LOOKSRARE' /> */}
    </Fragment>
  );
};

export default PromoSection;

// import React from 'react';

// import Button from '../utils/Button';
// import HorizontalLine from './HorizontalLine';
// import LooksrareIcon from './LooksrareIcon';
// import OpenseaIcon from './OpenseaIcon';

// function PromoSection() {
//   return (
//     <section className='relative mx-auto max-w-[1020px]  pt-2 pb-20'>
//       <HorizontalLine className='mb-6' />

//       <p className='mb-8 max-w-[350px] text-[15px]   leading-[22.5px] text-gray-textLighter md:max-w-[1020px] md:text-[18px] md:leading-[150%]'>
//         Playing Arts Crypto Edition (PACE) is a deck of playing cards featuring
//         works of 55 leading artists.
//         <br className='hidden md:block' /> Unique digital art collectibles
//         living on the Ethereum blockchain.
//       </p>
//       <div className='flex'>
//         <Button
//           icon={OpenseaIcon}
//           text='OPENSEA'
//           color='#407FDB'
//           className='mr-4'
//         />{' '}
//         <Button color='#04CD58' icon={LooksrareIcon} text='LOOKSRARE' />
//       </div>
//     </section>
//   );
// }

// export default PromoSection;
