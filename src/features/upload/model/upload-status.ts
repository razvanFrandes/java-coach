/** Where an upload is. `reading` = extracting text from the PDF, `analyzing` = waiting for the coach. */
export type UploadStatus = 'idle' | 'reading' | 'analyzing' | 'success' | 'error';
