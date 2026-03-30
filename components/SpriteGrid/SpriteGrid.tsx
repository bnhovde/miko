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
  },
);

const SheetPreview = dynamic(() => import("components/SheetPreview"), {
  ssr: false,
});

import styles from "./SpriteGrid.module.css";
import ButtonMore from "components/ButtonMore";

type Creation = (Sprite | Spritesheet) & { type: "sprite" | "sheet" };

type Props = {
  creations?: Creation[];
  onView?: (id: string, type: "sprite" | "sheet") => void;
  onDelete?: (id: string, type: "sprite" | "sheet") => void;
  onShare?: (id: string) => void;
};

const SpriteGrid: React.FC<Props> = ({
  creations,
  onView,
  onShare,
  onDelete,
}) => {
  const [playSpriteId, setPlaySpriteId] = React.useState<string | null>(null);

  const gridClass = classNames({
    [styles["grid"]]: true,
  });

  return (
    <section className={gridClass}>
      <ul className={styles.list}>
        {creations?.map((creation) => {
          const isSheet = creation.type === "sheet";

          return (
            <li
              key={creation.id}
              className={styles.item}
              onMouseEnter={() => setPlaySpriteId(creation.id)}
              onMouseLeave={() => setPlaySpriteId(creation.id)}
            >
              <div className={styles.actions}>
                <ButtonMore
                  label="Options"
                  options={[
                    {
                      label: "View",
                      onClick: () =>
                        onView && onView(creation.id, creation.type),
                    },
                    ...(creation.type === "sprite"
                      ? [
                          {
                            label: "Share",
                            onClick: () => onShare && onShare(creation.id),
                          },
                        ]
                      : []),
                    {
                      label: "Delete",
                      onClick: () =>
                        onDelete && onDelete(creation.id, creation.type),
                    },
                  ]}
                />
              </div>
              <div className={styles.inner}>
                <Link
                  href={`/app/editor/${
                    creation.type === "sprite" ? "sprite" : "sheet"
                  }/${creation.id}`}
                  className={styles.link}
                >
                  <div className={styles.sprite}>
                    {isSheet ? (
                      <SheetPreview
                        sheet={creation as Spritesheet}
                        isPlaying={playSpriteId === creation.id}
                      />
                    ) : (
                      <SpritePreviewPlayer
                        sprite={creation as Sprite}
                        isPlaying={playSpriteId === creation.id}
                      />
                    )}
                  </div>
                </Link>
              </div>
              <div className={styles.footer}>
                <p>
                  <span>{creation.name}</span>
                  {isSheet && <span> (sheet)</span>}
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
