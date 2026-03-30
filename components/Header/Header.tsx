"use client";

import React, { useEffect, useState } from "react";
import classNames from "classnames";
import styles from "./Header.module.css";
import Link from "next/link";
import { getRandomHash, getRandomPalette } from "lib/encoding/hash";
import SpritePreview from "components/SpritePreview";
import html2canvas from "html2canvas";

type Props = {
  title?: string;
  backUrl?: string;
  action?: {
    text: string;
    url: string;
  };
};

const Header: React.FC<Props> = ({ title, backUrl, action }) => {
  const headerClass = classNames({
    [styles["header"]]: true,
  });

  const [randomSprite, setRandomSprite] = useState<{ hash: string; palette: string[] } | null>(null);

  useEffect(() => {
    setRandomSprite({ hash: getRandomHash(4), palette: getRandomPalette() });
  }, []);

  const setFavicon = async () => {
    const headerSprite = document.getElementById("header-sprite");
    const canvasSprite = document.getElementById("editor-canvas");
    const favicon = document.getElementById("favicon") as HTMLLinkElement;
    const source = canvasSprite || headerSprite;

    if (!source || !favicon) {
      return;
    }

    const canvas = await html2canvas(source, {
      backgroundColor: null,
      scale: 1,
    });

    const data = canvas.toDataURL("image/x-icon");
    favicon.href = data;
  };

  useEffect(() => {
    setTimeout(() => {
      setFavicon();
    }, 100);
  }, []);

  return (
    <header className={headerClass}>
      <div className={styles.left}>
        <Link href={backUrl || "/"}>
          <span className={styles.logo}>
            <div className={styles.avatar}>
              {randomSprite && (
                <SpritePreview
                  id="header-sprite"
                  hash={randomSprite.hash}
                  palette={randomSprite.palette}
                />
              )}
            </div>
            miko
          </span>
        </Link>
      </div>
      <h1 className={styles.title}>{title && title}</h1>
      <div className={styles.right}>
        {action && (
          <Link href={action.url}>
            <span className={styles.text}>{action.text}</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
