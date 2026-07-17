// Client-side IndexedDB helper to store photos and albums locally
export interface DBPhoto {
  id: string;
  src: string; // Base64 or Blob URL
  alt: string;
  caption: string;
  width: number;
  height: number;
  isVideo?: boolean;
}

export interface DBAlbum {
  id: string;
  title: string;
  description: string;
  coverId?: string;
  password?: string;
  isPublic: boolean;
  photoIds: string[];
}

const DB_NAME = 'PhotoSharingDB';
const DB_VERSION = 1;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject('Not running in browser');
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('albums')) {
        db.createObjectStore('albums', { keyPath: 'id' });
      }
    };
  });
}

export async function savePhoto(photo: DBPhoto): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    const req = store.put(photo);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function savePhotosBulk(photos: DBPhoto[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    if (photos.length === 0) {
      resolve();
      return;
    }
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    photos.forEach((photo) => {
      store.put(photo);
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPhotos(ids: string[]): Promise<DBPhoto[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const store = tx.objectStore('photos');
    const photos: DBPhoto[] = [];
    let completed = 0;

    if (ids.length === 0) {
      resolve([]);
      return;
    }

    ids.forEach((id) => {
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result) {
          photos.push(req.result);
        }
        completed++;
        if (completed === ids.length) {
          // Sort to match order of input ids
          const idMap = new Map(photos.map(p => [p.id, p]));
          const sorted = ids.map(id => idMap.get(id)).filter(Boolean) as DBPhoto[];
          resolve(sorted);
        }
      };
      req.onerror = () => {
        completed++;
        if (completed === ids.length) {
          resolve(photos);
        }
      };
    });
  });
}

export async function getAllPhotos(): Promise<DBPhoto[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readonly');
    const store = tx.objectStore('photos');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('photos', 'readwrite');
    const store = tx.objectStore('photos');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function saveAlbum(album: DBAlbum): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('albums', 'readwrite');
    const store = tx.objectStore('albums');
    const req = store.put(album);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAlbum(id: string): Promise<DBAlbum | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('albums', 'readonly');
    const store = tx.objectStore('albums');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllAlbums(): Promise<DBAlbum[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('albums', 'readonly');
    const store = tx.objectStore('albums');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAlbum(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('albums', 'readwrite');
    const store = tx.objectStore('albums');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
