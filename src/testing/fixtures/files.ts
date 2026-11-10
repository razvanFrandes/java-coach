/** Builds a File for upload tests. `sizeBytes` fakes the size without allocating memory. */
export function makeFile({
  name = 'cv.pdf',
  type = 'application/pdf',
  sizeBytes = 1024,
}: { name?: string; type?: string; sizeBytes?: number } = {}): File {
  const file = new File(['%PDF-1.4 test'], name, { type });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

/** Text long enough to pass the "has text" rule. */
export const CV_TEXT =
  'Ana Popescu, Junior Java Developer. Built REST APIs with Spring Boot on Java 17. ' +
  'Wrote unit tests with JUnit 5 and Mockito. Built services with Maven.';
