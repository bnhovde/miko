import React, { useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { CgChevronLeftR } from "react-icons/cg";

import styles from "./Header.module.css";
import Link from "next/link";
import { getRandomHash, getRandomPalette } from "utils/hash";
import SpritePreview from "components/SpritePreview";
import ThemeToggle from "components/ThemeToggle";
import useTheme from "hooks/useTheme";
import html2canvas from "html2canvas";
import { useRouter } from "next/router";
import PopoverMenu from "components/PopoverMenu";
import { SITE_URL, STUDIO_URL, STUDIO_WINDOW, openApp } from "utils/apps";

type Props = {
  title?: string;
  backUrl?: string;
  action?: {
    text: string;
    url: string;
  };
};

const Header: React.FC<Props> = ({ title, backUrl, action }) => {
  const { resolved, toggle } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerClass = classNames({
    [styles["header"]]: true,
  });

  const randomSprite = useMemo(
    () => ({
      hash: getRandomHash(4),
      palette: getRandomPalette(),
    }),
    []
  );

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
        {/* The logo opens a menu of the other mikro apps, as the studio's
            does — its old job (back/home) is the menu's first entry. */}
        <div>
          <button
            type="button"
            className={styles["logo-button"]}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
          >
            <span className={styles.logo}>
              <div className={styles.avatar}>
                <SpritePreview
                  id="header-sprite"
                  hash={randomSprite.hash}
                  palette={randomSprite.palette}
                />
              </div>
              mikro
            </span>
          </button>
          <PopoverMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            placement={{ vertical: "bottom", horizontal: "left" }}
            width={220}
            options={[
              { label: backUrl ? "Back" : "Paint home", onClick: () => router.push(backUrl || "/") },
              { label: "Studio ↗", onClick: () => openApp(STUDIO_URL, STUDIO_WINDOW) },
              { label: "mikro.games", onClick: () => (window.location.href = SITE_URL) },
            ]}
          />
        </div>
      </div>
      <h1 className={styles.title}>{title && title}</h1>
      <div className={styles.right}>
        {action && (
          <Link href={action.url}>
            <a>
              <span className={styles.text}>{action.text}</span>
            </a>
          </Link>
        )}
        <ThemeToggle isDark={resolved === "dark"} onToggle={toggle} />
      </div>
    </header>
  );
};

export default Header;
