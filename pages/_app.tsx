import "backpack.css";
import "styles/index.css";

import { EditorProvider } from "context/EditorContext";
import { outlineWatcher } from "utils/a11y";
import { PAINT_WINDOW } from "utils/apps";

import type { AppProps } from "next/app";
import { useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    outlineWatcher();
    // So the studio's "Paint" link finds this tab instead of opening another.
    window.name = PAINT_WINDOW;
  }, []);

  return (
    <EditorProvider>
      <Component {...pageProps} />
    </EditorProvider>
  );
}

export default MyApp;
