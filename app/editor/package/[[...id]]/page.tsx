"use client";

import Header from "components/Header";
import Screen from "components/Screen";
import Main from "components/Main";
import Footer from "components/Footer";
import EditorPackage from "components/EditorPackage";
import PackageForm from "components/PackageForm";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { get } from "lib/storage";
import localStorageKeys from "constants/localStorageKeys";
import { SpritePackage } from "types/package";
import guid from "lib/guid";
import { usePackageStore } from "stores/package";
import html2canvas from "html2canvas";

export default function PackageEditorPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id ? String(Array.isArray(params.id) ? params.id[0] : params.id) : undefined;
  const showEditMode = searchParams.get("editMode") === "true";

  const { packageData, initPackage } = usePackageStore();

  useEffect(() => {
    if (id) {
      const raw = get(`${localStorageKeys.PACKAGE}-${id}`);
      if (raw) {
        initPackage(JSON.parse(raw) as SpritePackage);
        return;
      }
    }
    initPackage({
      id: guid(),
      version: "2.0.0",
      name: "Untitled package",
      description: "This is a sprite package made with Miko.app",
      size: 11,
      sprites: [],
    });
  }, [id]);

  const onExport = async () => {
    const element = document.getElementById("package-body");
    if (!element) return;

    const canvas = await html2canvas(element, { backgroundColor: null, scale: 2 });
    const data = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = data;
    link.download = packageData?.name ? `${packageData.name}.png` : "package.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Screen scrolling>
      <Header
        title={packageData?.name ?? "New Package"}
        action={{
          text: "Settings",
          url: id
            ? `/editor/package/${id}?editMode=true`
            : `/editor/package?editMode=true`,
        }}
      />

      <Main padded>
        {showEditMode ? <PackageForm /> : <EditorPackage />}
      </Main>

      <Footer
        shortcuts={[
          {
            children: "⌘ + L",
            label: "Toggle labels",
            hotKeys: "cmd+l",
            onToggle: () => {},
          },
        ]}
        button={{ text: "Export", onClick: onExport }}
      />
    </Screen>
  );
}
