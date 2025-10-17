import React from "react";
import classNames from "classnames";
import Link from "next/link";
import { Sprite } from "types/sprite";
import { Spritesheet } from "types/sheet";
import dynamic from "next/dynamic";

const SpritePreviewPlayer = dynamic(
  () => import("components/SpritePreviewPlayer"),
  {
    ssr: false,
  }
);

import styles from "./SpriteGrid.module.css";
import ButtonMore from "components/ButtonMore";

type Creation = (Sprite | Spritesheet) & { type: "sprite" | "sheet" };

type Props = {
  sprites?: Sprite[];
  creations?: Creation[];
  onView?: (id: string, type: "sprite" | "sheet") => void;
  onDelete?: (id: string, type: "sprite" | "sheet") => void;
  onShare?: (id: string) => void;
};

const SpriteGrid: React.FC<Props> = ({
  sprites: legacySprites,
  creations,
  onView,
  onShare,
  onDelete,
}) => {
  const [playSpriteId, setPlaySpriteId] = React.useState<string | null>(null);

  // Support legacy sprites prop or new creations prop
  const items =
    creations ||
    legacySprites?.map((s) => ({ ...s, type: "sprite" as const })) ||
    [];

  const gridClass = classNames({
    [styles["grid"]]: true,
  });

  return (
    <section className={gridClass}>
      <ul className={styles.list}>
        {items.map((item) => {
          const isSheet = item.type === "sheet";
          const displaySprite = isSheet
            ? (item as Spritesheet).sprites?.[0]
            : (item as Sprite);

          return (
            <li
              key={item.id}
              className={styles.item}
              onMouseEnter={() => setPlaySpriteId(item.id)}
              onMouseLeave={() => setPlaySpriteId(item.id)}
            >
              <div className={styles.actions}>
                <ButtonMore
                  label="Options"
                  options={[
                    {
                      label: "View",
                      onClick: () => onView && onView(item.id, item.type),
                    },
                    ...(item.type === "sprite"
                      ? [
                          {
                            label: "Share",
                            onClick: () => onShare && onShare(item.id),
                          },
                        ]
                      : []),
                    {
                      label: "Delete",
                      onClick: () => onDelete && onDelete(item.id, item.type),
                    },
                  ]}
                />
              </div>
              <div className={styles.inner}>
                <Link
                  href={`/app/editor/${
                    item.type === "sprite" ? "sprite" : "sheet"
                  }/${item.id}`}
                >
                  <a className={styles.link}>
                    <div className={styles.sprite}>
                      {displaySprite && (
                        <SpritePreviewPlayer
                          sprite={displaySprite}
                          isPlaying={playSpriteId === item.id}
                        />
                      )}
                    </div>
                  </a>
                </Link>
              </div>
              <div className={styles.footer}>
                <p>
                  <span>{item.name}</span>
                  {isSheet && <span> (sheet)</span>}
                  {!isSheet && (item as Sprite).isLegacy && (
                    <span> (legacy)</span>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default SpriteGrid;
