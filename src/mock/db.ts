/**
 * IndexedDB singleton + CRUD helpers for the mock layer.
 *
 * Database: "mockDB" (version 1)
 * One object store per top-level resource.
 */

const DB_NAME = "mockDB";
const DB_VERSION = 1;

const STORES = [
  "users",
  "bookings",
  "roomTypes",
  "roomUnits",
  "reviews",
  "coupons",
  "notifications",
  "amenities",
  "payments",
  "pricingRules",
  "auditLogs",
  "contacts",
  "settings",
  "uploads",
] as const;

export type StoreName = (typeof STORES)[number];

// Index definitions per store
const INDEXES: Partial<Record<StoreName, { name: string; keyPath: string; unique?: boolean }[]>> = {
  users: [
    { name: "by_email", keyPath: "email" },
    { name: "by_phone", keyPath: "phone", unique: true },
    { name: "by_role", keyPath: "role" },
  ],
  bookings: [
    { name: "by_userId", keyPath: "userId" },
    { name: "by_status", keyPath: "status" },
    { name: "by_reference", keyPath: "bookingReference", unique: true },
    { name: "by_propertyTypeId", keyPath: "propertyTypeId" },
    { name: "by_checkInDate", keyPath: "checkInDate" },
  ],
  roomTypes: [
    { name: "by_slug", keyPath: "slug", unique: true },
    { name: "by_status", keyPath: "status" },
  ],
  roomUnits: [
    { name: "by_roomTypeId", keyPath: "roomTypeId" },
    { name: "by_status", keyPath: "status" },
    { name: "by_roomNumber", keyPath: "roomNumber", unique: true },
  ],
  reviews: [
    { name: "by_userId", keyPath: "userId" },
    { name: "by_status", keyPath: "status" },
    { name: "by_rating", keyPath: "rating" },
  ],
  coupons: [
    { name: "by_code", keyPath: "code", unique: true },
    { name: "by_isActive", keyPath: "isActive" },
  ],
  notifications: [
    { name: "by_userId", keyPath: "userId" },
    { name: "by_isRead", keyPath: "isRead" },
    { name: "by_type", keyPath: "type" },
  ],
  amenities: [
    { name: "by_category", keyPath: "category" },
  ],
  payments: [
    { name: "by_bookingId", keyPath: "bookingId" },
    { name: "by_status", keyPath: "status" },
  ],
  pricingRules: [
    { name: "by_roomTypeId", keyPath: "roomTypeId" },
    { name: "by_isActive", keyPath: "isActive" },
  ],
  auditLogs: [
    { name: "by_action", keyPath: "action" },
    { name: "by_userId", keyPath: "userId" },
  ],
};

// ── Singleton DB connection ─────────────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: "id" });
          const idxDefs = INDEXES[name];
          if (idxDefs) {
            for (const idx of idxDefs) {
              store.createIndex(idx.name, idx.keyPath, { unique: idx.unique ?? false });
            }
          }
        }
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });

  return dbPromise;
}

// ── Generic helpers ─────────────────────────────────────────────────────────

function tx(
  db: IDBDatabase,
  store: StoreName,
  mode: IDBTransactionMode,
): IDBObjectStore {
  return db.transaction(store, mode).objectStore(store);
}

function wrap<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── CRUD exports ────────────────────────────────────────────────────────────

export async function getAll<T = unknown>(store: StoreName): Promise<T[]> {
  const db = await openDB();
  return wrap<T[]>(tx(db, store, "readonly").getAll() as IDBRequest<T[]>);
}

export async function getById<T = unknown>(store: StoreName, id: string): Promise<T | undefined> {
  const db = await openDB();
  return wrap<T | undefined>(tx(db, store, "readonly").get(id) as IDBRequest<T | undefined>);
}

export async function query<T = unknown>(
  store: StoreName,
  indexName: string,
  value: IDBValidKey,
): Promise<T[]> {
  const db = await openDB();
  const idx = tx(db, store, "readonly").index(indexName);
  return wrap<T[]>(idx.getAll(value) as IDBRequest<T[]>);
}

export async function create<T extends { id?: string }>(
  store: StoreName,
  data: T,
): Promise<T> {
  const db = await openDB();
  const record = { ...data, id: data.id ?? crypto.randomUUID() } as T;
  await wrap(tx(db, store, "readwrite").put(record));
  return record;
}

export async function update<T = unknown>(
  store: StoreName,
  id: string,
  patch: Partial<T>,
): Promise<T> {
  const db = await openDB();
  const s = tx(db, store, "readwrite");
  const existing = await wrap<T>(s.get(id) as IDBRequest<T>);
  if (!existing) throw new Error(`Record ${id} not found in ${store}`);
  const updated = { ...existing, ...patch };
  // Need a fresh transaction since the previous one may have closed
  const s2 = tx(db, store, "readwrite");
  await wrap(s2.put(updated));
  return updated;
}

export async function remove(store: StoreName, id: string): Promise<void> {
  const db = await openDB();
  await wrap(tx(db, store, "readwrite").delete(id));
}

export async function seed<T extends { id?: string }>(
  store: StoreName,
  records: T[],
): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(store, "readwrite");
  const s = transaction.objectStore(store);
  for (const record of records) {
    s.put(record);
  }
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function clear(store: StoreName): Promise<void> {
  const db = await openDB();
  await wrap(tx(db, store, "readwrite").clear());
}

export async function count(store: StoreName): Promise<number> {
  const db = await openDB();
  return wrap(tx(db, store, "readonly").count());
}

export { STORES };
