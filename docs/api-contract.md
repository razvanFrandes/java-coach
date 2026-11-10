# Coach API contract

The frontend talks to the server through one endpoint. The server does all the coaching work
(Codex, levels, gaps, ordering the path). The frontend only sends CV text and shows the answer.

Source of truth in code: `server/src/types.ts` (server) and `src/types/api.ts` (frontend).
The two files describe the same JSON and must change together.

## `POST /api/coach/analyze`

Analyses the text of a CV. The browser extracts the text from the PDF; the PDF itself is
never uploaded.

### Request

```json
{ "cvText": "Ana Popescu - Junior Java Developer\nBuilt REST APIs with Spring Boot..." }
```

| Field    | Type   | Rules                    |
| -------- | ------ | ------------------------ |
| `cvText` | string | 50 to 100 000 characters |

The whole body must be at most 1 MB.

### Response `200 OK`

```json
{
  "cached": false,
  "report": {
    "summary": "You have about two years of Java 17 and Spring Boot...",
    "skills": [
      {
        "area": "core-language",
        "score": 55,
        "level": "intermediate",
        "evidence": ["Java 17", "streams and lambdas"]
      },
      { "area": "concurrency", "score": 0, "level": "none", "evidence": [] }
    ],
    "gaps": [
      {
        "area": "concurrency",
        "severity": "missing",
        "reason": "Your CV does not mention concurrency, for example threads, ExecutorService or CompletableFuture."
      }
    ],
    "learningPath": [
      {
        "id": "concurrency-1",
        "area": "concurrency",
        "title": "Threads and executors",
        "goal": "Run work in parallel safely.",
        "topics": ["Thread", "ExecutorService", "synchronized"],
        "exercise": "Download ten URLs in parallel with an ExecutorService and count the bytes.",
        "effortHours": 6,
        "prerequisites": []
      }
    ]
  }
}
```

| Field                 | Type     | Meaning                                                                                      |
| --------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `cached`              | boolean  | `true` when the same CV text was analysed before and the stored report is sent               |
| `report.summary`      | string   | 2-4 sentences about the candidate, in the second person                                      |
| `report.skills`       | array    | Exactly one entry per skill area, in the order of the table below                            |
| `skills[].score`      | number   | 0-100                                                                                        |
| `skills[].level`      | string   | `none` (0), `beginner` (1-39), `intermediate` (40-64), `advanced` (65-84), `expert` (85-100) |
| `skills[].evidence`   | string[] | Short facts from the CV. Empty when nothing was found                                        |
| `report.gaps`         | array    | Areas at `none` or `beginner`. Most urgent first: lowest score, then area order              |
| `gaps[].severity`     | string   | `missing` (level `none`) or `weak` (level `beginner`)                                        |
| `gaps[].reason`       | string   | One sentence, ready to show                                                                  |
| `report.learningPath` | array    | Steps already in the order to do them: prerequisites first, then weakest area                |
| `prerequisites`       | string[] | Ids of steps that come first                                                                 |

Skill areas, in display order:

| `area`          | Label                  |
| --------------- | ---------------------- |
| `core-language` | Core language          |
| `oop`           | Object-oriented design |
| `collections`   | Collections            |
| `concurrency`   | Concurrency            |
| `jvm`           | JVM internals          |
| `spring`        | Spring                 |
| `testing`       | Testing                |
| `build-tools`   | Build tools            |
| `databases`     | Databases              |

### Errors

Every error has the same body:

```json
{ "error": { "code": "COACH_FAILED", "message": "Codex is not logged in on the server..." } }
```

`message` is written for the user and the frontend shows it as is.

| Status | `code`              | When                                                 |
| ------ | ------------------- | ---------------------------------------------------- |
| 400    | `INVALID_REQUEST`   | Body is not JSON, or `cvText` breaks the rules above |
| 404    | `NOT_FOUND`         | Unknown `/api` route                                 |
| 413    | `PAYLOAD_TOO_LARGE` | Body over 1 MB                                       |
| 500    | `INTERNAL_ERROR`    | Unexpected server error                              |
| 502    | `COACH_FAILED`      | Codex failed or answered in the wrong format         |
| 504    | `COACH_TIMEOUT`     | Codex did not answer in time (`CODEX_TIMEOUT_MS`)    |

## `GET /api/health`

`200 OK` with `{ "status": "ok" }`. Used to check that the server is up.
