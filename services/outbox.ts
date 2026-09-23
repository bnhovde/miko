import type { Sprite } from "../types/sprite";

/** Sending a sprite to the studio.
 *
 *  Both apps are served from one origin (mikro.games/paint and
 *  mikro.games/studio), which is the only reason this works: IndexedDB and
 *  BroadcastChannel are keyed by origin, so the two can hand data to each
 *  other with no backend and no postMessage bridge. From separate domains
 *  none of it would be possible.
 *
 *  **This is one half of a contract.** The studio's `src/outbox.ts` reads
 *  these records and must agree on the database name, the store name and
 *  the record shape. It owns the fuller version (read, remove, watch);
 *  this is only the sender. They are duplicated rather than shared because
 *  moving the module into @boxworld/miko would mean the studio could not
 *  build until that package was republished — worth doing, but not as part
 *  of shipping this.
 */

const DB_NAME = "mikro";
const STORE = "outbox";
const DB_VERSION = 1;
const CHANNEL = "mikro-outbox";

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

/** Put a sprite in the studio's inbox.
 *
 *  Only the fields the studio's sprite format actually has are sent —
 *  paint's `Sprite` also carries an author and a description, which are
 *  this app's bookkeeping and have no meaning inside a game. The id does
 *  go: it is how the studio recognises a re-send of the same sprite (or of
 *  one of its frames, imported separately) and updates it in place rather
 *  than adding a duplicate. */
export const sendToStudio = async (sprite: Sprite): Promise<void> => {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sprite: {
          id: sprite.id,
          name: sprite.name,
          size: sprite.size,
          fps: sprite.fps,
          palette: sprite.palette,
          frames: sprite.frames,
        },
        from: "paint",
        sentAt: Date.now(),
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }

};

/** Tell an open studio to look. Separate from the write on purpose: the
 *  record is the durable half and goes in immediately, while this is timed
 *  to land after the departure animation, so the sprite appears to leave
 *  one tab before arriving in the other. A missed message costs nothing —
 *  the studio finds the record on its next load. */
export const announceSend = (): void => {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage({ type: "changed" });
    channel.close();
  } catch {
    // BroadcastChannel is missing in a few older browsers; the send itself
    // still happened.
  }
};
