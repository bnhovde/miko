"use client";

import React, { useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";

import styles from "./Timeline.module.css";
import useKeyPressed from "hooks/useKey";
import Item from "./Item";
import useDrop from "hooks/useDrop";
import { useSpriteStore } from "stores/sprite";

const Timeline: React.FC = () => {
  const { spriteData, currentFrame, addFrame, changeFrame, deleteFrame, reorderFrames } =
    useSpriteStore();

  const dropRef = useRef<HTMLUListElement>(null);
  const [draggedIndex, setDraggedIndex] = useState(-1);
  const [draggedOverIndex, setDraggedOverIndex] = useState(-1);

  const onDrop = () => {
    reorderFrames(draggedIndex, draggedOverIndex);
    setDraggedIndex(-1);
    setDraggedOverIndex(-1);
  };

  const { isZoneActive } = useDrop({ ref: dropRef, onDrop });

  const cmdDown = useKeyPressed((ev: KeyboardEvent) => ev.metaKey);
  const shiftDown = useKeyPressed((ev: KeyboardEvent) => ev.shiftKey);

  const onlyOneFrame = (spriteData?.frames.length ?? 0) < 2;

  const onFrameClick = (frame: number) => {
    if (cmdDown) {
      addFrame(frame, spriteData?.frames[frame]);
    } else if (shiftDown && !onlyOneFrame) {
      deleteFrame(frame);
    } else {
      changeFrame(frame);
    }
  };

  const onAddFrameClick = () => {
    addFrame((spriteData?.frames.length ?? 1) - 1);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <span className={styles.line} aria-hidden />
        <ul className={styles.timeline} ref={dropRef}>
          {spriteData?.frames.map((f, i) => (
            <Item
              key={`${i}-${f}`}
              order={i}
              hash={f}
              palette={spriteData.palette}
              isActive={isZoneActive}
              isSelected={currentFrame === i}
              shiftDown={shiftDown}
              cmdDown={cmdDown}
              draggedIndex={draggedIndex}
              draggedOverIndex={draggedOverIndex}
              onDragStart={() => setDraggedIndex(i)}
              onDragOver={() => setDraggedOverIndex(i)}
              onDragEnd={() => { setDraggedIndex(-1); setDraggedOverIndex(-1); }}
              onClick={onFrameClick}
            />
          ))}
          <li className={styles.item} data-empty>
            <button className={styles.button} onClick={onAddFrameClick}>
              <FiPlus />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Timeline;
