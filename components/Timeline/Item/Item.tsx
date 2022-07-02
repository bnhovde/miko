import React, { useRef, useState } from "react";
import classNames from "classnames";
import { FiCopy, FiTrash2 } from "react-icons/fi";

import useDrag from "hooks/useDrag";

import Frame from "components/Frame";

import styles from "./Item.module.css";

type Props = {
  hash: string;
  palette: string[];
  isActive: boolean;
  isSelected: boolean;
  order: number;
  draggedIndex: number;
  draggedOverIndex: number;
  cmdDown?: boolean;
  shiftDown?: boolean;
  onlyOneFrame?: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onClick: (order: number) => void;
};

const Item: React.FC<Props> = ({
  hash,
  palette,
  isActive,
  isSelected,
  order,
  draggedIndex,
  draggedOverIndex,
  cmdDown,
  shiftDown,
  onlyOneFrame,
  onDragStart,
  onDragEnd,
  onDragOver,
  onClick,
}) => {
  const ref = useRef<HTMLLIElement>(null);
  const isCurrentItem = draggedIndex === order;
  const [isHovered, setIsHovered] = useState(false);

  const { dragState } = useDrag({
    ref: ref,
    order: order,
    onDragStart,
    onDragEnd,
    onDragOver,
  });

  const affectedRange = {
    min: Math.min(draggedIndex, draggedOverIndex),
    max: Math.max(draggedIndex, draggedOverIndex),
  };
  const isAffected = order >= affectedRange.min && order <= affectedRange.max;
  const shouldMove = isActive && isAffected && !isCurrentItem;

  const shouldMoveLeft = shouldMove && draggedOverIndex >= draggedIndex;
  const shouldMoveRight = shouldMove && draggedOverIndex < draggedIndex;

  const itemClass = classNames({
    [styles["item"]]: true,
    [styles["-is-selected"]]: isSelected && !isActive,
    [styles["-is-hovered"]]: isHovered,
    [styles["-is-dragging"]]:
      isActive && dragState === "dragging" && isCurrentItem,
    [styles["-is-dodging"]]: isActive && !isCurrentItem,
    [styles["-move-left"]]: shouldMoveLeft,
    [styles["-move-right"]]: shouldMoveRight,
  });

  return (
    <li className={itemClass} ref={ref}>
      <button className={styles.button} onClick={() => onClick(order)}>
        <Frame hash={hash} palette={palette} />
      </button>

      <div
        className={styles.overlay}
        data-visible={(shiftDown && !onlyOneFrame) || cmdDown}
      >
        <>{cmdDown && <FiCopy />}</>
        <>{shiftDown && <FiTrash2 />}</>
      </div>
    </li>
  );
};

export default Item;
