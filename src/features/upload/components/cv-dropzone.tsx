import { useState, type DragEvent } from 'react';
import { FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CvDropzoneProps {
  onFile: (file: File) => void;
  disabled: boolean;
}

/** Drop target plus file picker. It only hands over the file; checking it is someone else's job. */
export function CvDropzone({ onFile, disabled }: CvDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && !disabled) onFile(file);
  }

  return (
    <div
      data-testid="cv-dropzone"
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border-2 border-dashed bg-card px-6 py-12 text-center transition-colors',
        isDragging && 'border-primary bg-accent',
        disabled && 'opacity-60',
      )}
    >
      <FileUp aria-hidden className="size-10 text-primary" />
      <p className="text-lg font-medium">Drag your CV here</p>
      <p className="text-sm text-muted-foreground">
        PDF only, up to 5 MB. The file stays in your browser; only its text is analysed.
      </p>
      <label
        className={cn(
          'mt-2 cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-within:ring-2 focus-within:ring-ring',
          disabled && 'pointer-events-none',
        )}
      >
        Choose a PDF
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
            event.target.value = ''; // allows picking the same file again after an error
          }}
        />
      </label>
    </div>
  );
}
