import { FC, HTMLAttributes } from "react";

const Looksrare: FC<HTMLAttributes<SVGElement>> = (props) => {
  return (
    <svg
      width="25"
      height="20"
      viewBox="0 0 25 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.4999 11.3175C10.3546 11.3175 8.61475 9.57933 8.61475 7.43238C8.61475 5.28542 10.3546 3.54724 12.4999 3.54724C14.6452 3.54724 16.385 5.28542 16.385 7.43238C16.385 9.57933 14.6452 11.3175 12.4999 11.3175ZM10.8107 7.43238C10.8107 8.3665 11.5674 9.12156 12.4999 9.12156C13.4323 9.12156 14.1891 8.3665 14.1891 7.43238C14.1891 6.49825 13.4323 5.74319 12.4999 5.74319C11.5674 5.74319 10.8107 6.49825 10.8107 7.43238Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 7.4375L7.43243 0H17.5676L25 7.4375L12.5 19.9324L0 7.4375ZM18.2432 4.72973C15.0845 1.55743 9.91554 1.55743 6.75676 4.72973L4.05405 7.43243L6.75676 10.1351C9.91554 13.3074 15.0845 13.3074 18.2432 10.1351L20.9459 7.43243L18.2432 4.72973Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default Looksrare;
