import React from "react";
import classNames from "classnames";
import Link from "next/link";
import { Sprite } from "types/sprite";
import dynamic from "next/dynamic";

const SpritePreviewPlayer = dynamic(
  () => import("components/SpritePreviewPlayer"),
  {
    ssr: false,
  }
);

import styles from "./SpriteGrid.module.css";
import ButtonMore from "components/ButtonMore";

type Props = {
  sprites?: Sprite[];
  onView?: (spriteId: string) => void;
  onDelete?: (spriteId: string) => void;
  onShare?: (spriteId: string) => void;
};

const SpriteGrid: React.FC<Props> = ({
  sprites,
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
        {sprites?.map((sprite) => (
          <li
            key={sprite.id}
            className={styles.item}
            onMouseEnter={() => setPlaySpriteId(sprite.id)}
            onMouseLeave={() => setPlaySpriteId(sprite.id)}
          >
            <div className={styles.actions}>
              <ButtonMore
                label="Rediger"
                options={[
                  {
                    label: "View",
                    onClick: () => onView && onView(sprite.id),
                  },
                  {
                    label: "Share",
                    onClick: () => onShare && onShare(sprite.id),
                  },
                  {
                    label: "Delete",
                    onClick: () => onDelete && onDelete(sprite.id),
                  },
                ]}
              />
            </div>
            <div className={styles.inner}>
              <Link href={`/app/editor/sprite/${sprite.id}`}>
                <a className={styles.link}>
                  <div className={styles.sprite}>
                    <SpritePreviewPlayer
                      sprite={sprite}
                      isPlaying={playSpriteId === sprite.id}
                    />
                  </div>
                </a>
              </Link>
            </div>
            <div className={styles.footer}>
              <p>
                <span>{sprite.name}</span>
                {sprite.isLegacy && <span>(legacy)</span>}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SpriteGrid;
