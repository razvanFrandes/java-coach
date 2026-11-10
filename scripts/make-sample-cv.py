"""Writes small text-based PDF CVs used by tests and for manual demos.

Usage: python3 scripts/make-sample-cv.py
No dependencies: the PDF is assembled by hand (one page, Helvetica, plain text lines).
"""
from pathlib import Path


def escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def make_pdf(lines: list[str]) -> bytes:
    content = ["BT", "/F1 11 Tf", "14 TL", "50 790 Td"]
    for line in lines:
        content.append(f"({escape(line)}) Tj T*")
    content.append("ET")
    stream = "\n".join(content).encode("latin-1")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
    ]
    out = bytearray(b"%PDF-1.4\n")
    offsets = []
    for number, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += f"{number} 0 obj\n".encode() + body + b"\nendobj\n"
    xref_at = len(out)
    out += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode()
    for offset in offsets:
        out += f"{offset:010d} 00000 n \n".encode()
    out += f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_at}\n%%EOF\n".encode()
    return bytes(out)


SAMPLE_CV = [
    "Ana Popescu - Junior Java Developer",
    "",
    "Experience",
    "2023 - now  Backend developer at ShopFlow",
    "- Built REST APIs with Spring Boot and Spring Data JPA on Java 17",
    "- Wrote unit tests with JUnit 5 and Mockito",
    "- Used streams and lambdas to process orders; modelled the domain with interfaces",
    "- Stored data in PostgreSQL, wrote SQL queries and Flyway migrations",
    "- Built and packaged services with Maven, deployed with Docker",
    "",
    "Education",
    "BSc Computer Science. Courses: data structures (ArrayList, HashMap), OOP, design patterns",
    "",
    "Skills: Java, Spring Boot, JUnit, Maven, PostgreSQL, Git",
]

if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    (root / "src/test/fixtures/sample-cv.pdf").write_bytes(make_pdf(SAMPLE_CV))
    (root / "public").mkdir(exist_ok=True)
    (root / "public/sample-cv.pdf").write_bytes(make_pdf(SAMPLE_CV))
    print("wrote src/test/fixtures/sample-cv.pdf and public/sample-cv.pdf")
