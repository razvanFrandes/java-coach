import { useState, type DragEvent } from 'react';
import { FileUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CvDropzoneProps {
  onFile: (file: File) => void;
  disabled: boolean;
}

/** Drop target plus file picker. It only hands the file over; checking it is not its job. */
export function CvDropzone({ onFile, disabled }: CvDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && !disabled) onFile(file);
  }

  return (
    <Card
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn('border-2 border-dashed', isDragging && 'border-primary')}
    >
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <FileUp aria-hidden className="size-10 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-lg font-medium">Drag your CV here</p>
          <p className="text-sm text-muted-foreground">
            PDF only, up to 5 MB. The file stays in your browser; only its text is sent.
          </p>
        </div>
        <div className="grid w-full max-w-sm gap-2 text-left">
          <Label htmlFor="cv-file">Choose a PDF</Label>
          <Input
            id="cv-file"
            type="file"
            accept="application/pdf,.pdf"
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFile(file);
              event.target.value = ''; // so the same file can be picked again after an error
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
