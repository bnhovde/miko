import React from "react";
import classNames from "classnames";

import styles from "./ButtonLink.module.css";
import Link from "next/link";

type Props = {
  children: JSX.Element[] | JSX.Element | string;
  href: string;
  full?: boolean;
  secondary?: boolean;
  disabled?: boolean;
};

const ButtonLink: React.FC<Props> = ({ children, full, secondary, href }) => {
  const buttonClass = classNames({
    [styles["button"]]: true,
    [styles["-secondary"]]: secondary,
    [styles["-full"]]: full,
  });

  return (
    <Link href={href}>
      <a className={buttonClass}>
        <span>{children}</span>
      </a>
    </Link>
  );
};

export default ButtonLink;
