import { createContext, useContext } from "react";

import { useMiko, type MikoApi, type UseMikoOptions } from "./useMiko";

const MikoContext = createContext<MikoApi | null>(null);

export type MikoProviderProps = UseMikoOptions & {
  children: React.ReactNode;
};

/** Owns one editor's state and hands it to every Miko* component below it, so
 *  a host can arrange the pieces however it likes without threading props. */
export function MikoProvider({ children, ...options }: MikoProviderProps) {
  const miko = useMiko(options);
  return <MikoContext.Provider value={miko}>{children}</MikoContext.Provider>;
}

/** The editor state and actions from the nearest MikoProvider. */
export function useMikoContext(): MikoApi {
  const miko = useContext(MikoContext);
  if (!miko) {
    throw new Error(
      "Miko components must be rendered inside a <MikoProvider> (or <Miko>)."
    );
  }
  return miko;
}
