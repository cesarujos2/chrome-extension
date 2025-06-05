import { createRequest } from "../utils/createRequestContent";

interface PDFEntry {
  name: string;
  file: File;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PDFStorage', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pdfs')) {
        db.createObjectStore('pdfs', { keyPath: 'name' });
      }
    };
  });
}

export async function clearDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pdfs', 'readwrite');
    const store = tx.objectStore('pdfs');
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function savePDFtoDB(name: string, file: File): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pdfs', 'readwrite');
    const store = tx.objectStore('pdfs');
    const request = store.put({ name, file });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllPDFs(): Promise<PDFEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pdfs', 'readonly');
    const store = tx.objectStore('pdfs');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as PDFEntry[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getPDFById(id: string): Promise<PDFEntry | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pdfs', 'readonly');
    const store = tx.objectStore('pdfs');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as PDFEntry);
    request.onerror = () => reject(request.error);
  });
}

export function createDropZone(): void {
  if (!window.location.href.includes("std.mtc.gob.pe")) return;
  const dropZone = document.createElement('div');
  Object.assign(dropZone.style, {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    width: '90px',
    height: '60px',
    padding: '10px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    border: '2px dashed #fff',
    zIndex: '9999',
    fontSize: '12px',
    cursor: 'pointer',
  });
  dropZone.textContent = 'Derivar informe';
  document.body.appendChild(dropZone);

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  });

  dropZone.addEventListener('drop', async (e: DragEvent) => {
    e.preventDefault();
    dropZone.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    dropZone.textContent = 'Procesando...';
    const items = e.dataTransfer?.items;
    if (!items) {
      dropZone.textContent = 'Derivar informe';
      console.error('No se encontraron elementos en la transferencia de datos.');
      return;
    }

    // ¡CRÍTICO! Extraer todas las entradas ANTES de operaciones asíncronas
    const entries: FileSystemEntry[] = [];
    for (const item of Array.from(items)) {
      if (item.kind === 'file') {
        const entry = (item as any).webkitGetAsEntry?.() as FileSystemEntry;
        if (entry) {
          entries.push(entry);
        }
      }
    }

    // Ahora sí podemos hacer operaciones asíncronas
    await clearDB();
    let count = 0;
    let pdfIdList: string[] = [];

    try {
      for (const entry of entries) {
        if (entry.isDirectory) {
          count += await readFolder(entry as FileSystemDirectoryEntry, async (file) => {
            const match = file.name.match(/E-\d{6}-\d{4}/);
            if (match) {
              const id = match[0];
              await savePDFtoDB(id, file);
              count++;
              pdfIdList.push(id);
            }
          });
        } else if (entry.isFile && entry.name.toLowerCase().endsWith('.pdf')) {
          const fileEntry = entry as FileSystemFileEntry;
          const file = await getFileFromEntry(fileEntry);

          const match = file.name.match(/E-\d{6}-\d{4}/);
          if (match) {
            const id = match[0];
            await savePDFtoDB(id, file);
            count++;
            pdfIdList.push(id);
          }
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      dropZone.textContent = 'Derivar informe';

      const request = createRequest()

      request.action = "searchRoadMap"
      request.content.isOffice = false
      request.content.documents = pdfIdList;
      request.content.usedDragAndDrop = true;
      chrome.runtime.sendMessage(request);
    }
  });
}

// Función auxiliar para convertir FileSystemFileEntry a File
function getFileFromEntry(fileEntry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => {
    fileEntry.file(resolve, reject);
  });
}

// Función auxiliar para leer todas las entradas de un directorio
function getAllEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    const allEntries: FileSystemEntry[] = [];

    function readBatch() {
      reader.readEntries((entries) => {
        if (entries.length === 0) {
          resolve(allEntries);
        } else {
          allEntries.push(...entries);
          readBatch();
        }
      }, reject);
    }

    readBatch();
  });
}

// FUNCIÓN CORREGIDA: readFolder ahora maneja correctamente las operaciones asíncronas
async function readFolder(
  dirEntry: FileSystemDirectoryEntry,
  onPDF: (file: File) => Promise<void>
): Promise<number> {
  let count = 0;

  try {
    const reader = dirEntry.createReader();
    const entries = await getAllEntries(reader);

    for (const entry of entries) {
      if (entry.isFile && entry.name.toLowerCase().endsWith('.pdf')) {
        try {
          const file = await getFileFromEntry(entry as FileSystemFileEntry);
          await onPDF(file);
          count++;
        } catch (error) {
          console.error(`Error processing file ${entry.name}:`, error);
        }
      } else if (entry.isDirectory) {
        // Recursivamente leer subdirectorios
        const subCount = await readFolder(entry as FileSystemDirectoryEntry, onPDF);
        count += subCount;
      }
    }

    return count;

  } catch (error) {
    console.error(`Error reading folder ${dirEntry.name}:`, error);
    return count;
  }
}

// Interfaces (sin cambios)
interface FileSystemEntry {
  readonly name: string;
  readonly isFile: boolean;
  readonly isDirectory: boolean;
}

interface FileSystemFileEntry extends FileSystemEntry {
  file: (successCallback: (file: File) => void, errorCallback?: (err: DOMException) => void) => void;
}

interface FileSystemDirectoryEntry extends FileSystemEntry {
  createReader: () => FileSystemDirectoryReader;
}

interface FileSystemDirectoryReader {
  readEntries: (successCallback: (entries: FileSystemEntry[]) => void, errorCallback?: (err: DOMException) => void) => void;
}