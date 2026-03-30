"use client";

import React, { useState } from "react";
import classNames from "classnames";

import styles from "./SpriteForm.module.css";
import { useRouter, useParams } from "next/navigation";
import { useSpriteStore } from "stores/sprite";

const SpriteForm: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { spriteData, changeName } = useSpriteStore();

  const [name, setName] = useState(spriteData?.name ?? "New Sprite");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    changeName(name);
    const id = params.id ? String(Array.isArray(params.id) ? params.id[0] : params.id) : undefined;
    router.push(id ? `/editor/sprite/${id}` : "/editor/sprite");
  };

  return (
    <form className={classNames(styles.form)} onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
};

export default SpriteForm;
