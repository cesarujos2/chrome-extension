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
      dropZone.textContent = 'Derivar masivo';
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
      dropZone.textContent = 'Derivar masivo';

      try {
        // Modal para seleccionar tipo de documento
        const isOffice = await showDocumentTypeModal();

        const request = createRequest()

        request.action = "searchRoadMap"
        request.content.isOffice = isOffice;
        request.content.documents = pdfIdList;
        request.content.usedDragAndDrop = true;
        chrome.runtime.sendMessage(request);
      } catch (error) {
        console.log('Modal cancelled by user, process aborted');
        // No enviamos el request si el usuario cancela
      }
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


// Función para mostrar modal de selección de tipo de documento
async function showDocumentTypeModal(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Crear overlay con efecto blur
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: '10000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: '0',
      transition: 'opacity 0.15s ease-out'
    });

    // Crear modal modo oscuro
    const modal = document.createElement('div');
    Object.assign(modal.style, {
      background: '#000000',
      padding: '32px 28px',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      textAlign: 'center',
      maxWidth: '320px',
      width: '90%',
      transform: 'scale(0.95) translateY(10px)',
      transition: 'all 0.15s ease-out'
    });

    // Título elegante modo oscuro
    const title = document.createElement('h2');
    title.textContent = 'Tipo de documento';
    Object.assign(title.style, {
      margin: '0 0 24px 0',
      color: '#ffffff',
      fontSize: '20px',
      fontWeight: '600',
      letterSpacing: '-0.025em',
      lineHeight: '1.2'
    });

    // Contenedor de botones horizontales
    const buttonContainer = document.createElement('div');
    Object.assign(buttonContainer.style, {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center'
    });

    // Botón Informe
    const informeBtn = document.createElement('button');
    informeBtn.textContent = 'Informe';
    Object.assign(informeBtn.style, {
      padding: '10px 20px',
      background: '#ffffff',
      color: '#000000',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      letterSpacing: '0.025em',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      minWidth: '80px'
    });

    // Botón Oficio 2024
    const oficioBtn = document.createElement('button');
    oficioBtn.textContent = 'Oficio 2024';
    Object.assign(oficioBtn.style, {
      padding: '10px 20px',
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '0.025em',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      minWidth: '80px'
    });

    // Event listeners con animaciones
    informeBtn.addEventListener('click', () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95) translateY(10px)';
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(false);
      }, 150);
    });

    oficioBtn.addEventListener('click', () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.95) translateY(10px)';
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(true);
      }, 150);
    });

    // Cerrar modal al hacer clic fuera
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.95) translateY(10px)';
        setTimeout(() => {
          document.body.removeChild(overlay);
          reject(new Error('Modal cancelled by user'));
        }, 150);
      }
    });

    // Hover effects modo oscuro
    informeBtn.addEventListener('mouseenter', () => {
      informeBtn.style.background = '#f0f0f0';
      informeBtn.style.transform = 'translateY(-1px)';
    });
    
    informeBtn.addEventListener('mouseleave', () => {
      informeBtn.style.background = '#ffffff';
      informeBtn.style.transform = 'translateY(0)';
    });

    oficioBtn.addEventListener('mouseenter', () => {
      oficioBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      oficioBtn.style.transform = 'translateY(-1px)';
    });
    
    oficioBtn.addEventListener('mouseleave', () => {
      oficioBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      oficioBtn.style.transform = 'translateY(0)';
    });

    // Ensamblar modal
    buttonContainer.appendChild(oficioBtn);
    buttonContainer.appendChild(informeBtn);
    modal.appendChild(title);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);

    // Agregar al DOM con animación de entrada
    document.body.appendChild(overlay);
    
    // Trigger animación de entrada
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'scale(1) translateY(0)';
    });
  });
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