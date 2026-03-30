/**
 * Package store — manages the currently-loaded sprite package.
 * A package is a named collection of sprites that can be exported as a PNG sprite sheet.
 */

import { create } from "zustand";
import { SpritePackage } from "types/package";
import { set as lsSet } from "lib/storage";
import localStorageKeys from "constants/localStorageKeys";

interface PackageState {
  packageData: SpritePackage | undefined;

  /** Load a package into the editor. */
  initPackage: (pkg: SpritePackage) => void;
  /** Replace package metadata and persist. */
  updatePackage: (pkg: SpritePackage) => void;
}

export const usePackageStore = create<PackageState>()((set) => ({
  packageData: undefined,

  initPackage: (pkg) => set({ packageData: pkg }),

  updatePackage: (pkg) => {
    lsSet(`${localStorageKeys.PACKAGE}-${pkg.id}`, JSON.stringify(pkg));
    set({ packageData: pkg });
  },
}));
