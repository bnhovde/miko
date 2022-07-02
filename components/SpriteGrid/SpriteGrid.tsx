import React from "react";
import classNames from "classnames";
import Link from "next/link";
import { Sprite } from "types/sprite";
import dynamic from "next/dynamic";

const SpritePreview = dynamic(() => import("components/SpritePreview"), {
  ssr: false,
});

import styles from "./SpriteGrid.module.css";

type Props = {
  sprites?: Sprite[];
};

const SpriteGrid: React.FC<Props> = ({ sprites }) => {
  const gridClass = classNames({
    [styles["grid"]]: true,
  });

  return (
    <section className={gridClass}>
      <ul className={styles.list}>
        {sprites?.map((sprite) => (
          <li key={sprite.id} className={styles.item}>
            <div className={styles.inner}>
              <Link href={`/app/editor/${sprite.id}`}>
                <a className={styles.link}>
                  <div className={styles.sprite}>
                    <SpritePreview
                      hash={sprite.frames[0]}
                      palette={sprite.palette}
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
