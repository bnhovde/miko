"use client";

import React, { useState } from "react";
import classNames from "classnames";

import styles from "./PackageForm.module.css";
import { useRouter, useParams } from "next/navigation";
import { usePackageStore } from "stores/package";

const PackageForm: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { packageData, updatePackage } = usePackageStore();

  const [name, setName] = useState(packageData?.name ?? "New Package");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!packageData) return;
    event.preventDefault();
    updatePackage({ ...packageData, name });
    const id = params.id ? String(Array.isArray(params.id) ? params.id[0] : params.id) : undefined;
    router.push(id ? `/editor/package/${id}` : "/editor/package");
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

export default PackageForm;
