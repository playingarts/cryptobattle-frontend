const isEthAddress = (address: string) => {
  return /^(0x){1}[0-9a-fA-F]{40}$/i.test(address);
};

const truncateMiddle = (word: string) => {
  if (!word) {
    return "";
  }
  const tooLongChars = 19; // arbitrary

  if (word.length < tooLongChars) {
    return word;
  }

  const ellipsis = "...";
  const charsOnEitherSide = Math.floor(tooLongChars / 2) - ellipsis.length;

  return (
    word.slice(0, charsOnEitherSide) + ellipsis + word.slice(-charsOnEitherSide)
  );
};

const formatUsername = (username: string) => {
  if (isEthAddress(username)) {
    return truncateMiddle(username);
  }
  return username;
};

export { isEthAddress, truncateMiddle, formatUsername };
