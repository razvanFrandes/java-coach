# Coach API contract

The frontend talks to the coach through one endpoint. Any backend (the Node server in
`server/` today, or a Java service later) must implement exactly this.

TypeScript source of truth: `src/domain/types.ts` (types) and
`server/src/application/coach-report-schema.ts` (runtime validation).

## `POST /api/coach/analyze`

Analyses the text of a CV. The browser extracts the text from the PDF; the PDF itself is
never uploaded.

### Request

```http
POST /api/coach/analyze
Content-Type: application/json
```

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
    "summary": "Junior backend developer with about two years of Java 17 and Spring Boot...",
    "assessments": [
      { "area": "core-language", "score": 55, "evidence": ["Java 17", "streams and lambdas"] },
      { "area": "concurrency", "score": 0, "evidence": [] }
    ],
    "steps": [
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

| Field                    | Type     | Meaning                                                                                                         |
| ------------------------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| `cached`                 | boolean  | `true` when the same CV text was analysed before and the stored report is returned                              |
| `report.summary`         | string   | 2-4 sentences about the candidate                                                                               |
| `report.assessments[]`   | array    | Ideally one entry per skill area (missing areas count as score 0)                                               |
| `assessments[].area`     | enum     | `core-language`, `oop`, `collections`, `concurrency`, `jvm`, `spring`, `testing`, `build-tools`, `databases`    |
| `assessments[].score`    | number   | 0-100. The frontend derives the level: 0 none, 1-39 beginner, 40-64 intermediate, 65-84 advanced, 85-100 expert |
| `assessments[].evidence` | string[] | Short facts quoted from the CV. Empty when nothing was found                                                    |
| `report.steps[]`         | array    | Suggested learning steps, in any order (the frontend orders them)                                               |
| `steps[].id`             | string   | Unique, e.g. `concurrency-1`                                                                                    |
| `steps[].effortHours`    | number   | Estimated effort in hours                                                                                       |
| `steps[].prerequisites`  | string[] | Ids of steps that should come first. Unknown ids are ignored                                                    |

The backend returns **raw material**: levels, gaps and the path order are computed by the
frontend domain (`src/domain`), so every backend gets the same rules for free.

### Errors

Every error has the same body:

```json
{
  "error": {
    "code": "COACH_FAILED",
    "message": "Codex returned an answer that does not match the CoachReport contract."
  }
}
```

| Status | `code`              | When                                                  |
| ------ | ------------------- | ----------------------------------------------------- |
| 400    | `INVALID_REQUEST`   | `cvText` missing, not a string, too short or too long |
| 413    | `PAYLOAD_TOO_LARGE` | Body over 1 MB                                        |
| 502    | `COACH_FAILED`      | The AI failed or answered outside the contract        |
| 504    | `COACH_TIMEOUT`     | The AI did not answer in time                         |
| 404    | `NOT_FOUND`         | Unknown `/api` route                                  |
| 500    | `INTERNAL_ERROR`    | Anything else                                         |

The frontend shows `error.message` to the user, so write it for people.

## `GET /api/health`

`200 { "status": "ok" }`. Used to check that the server is up.

## Notes for a Java implementation

- Map the JSON with records, e.g. `record AreaAssessment(SkillArea area, int score, List<String> evidence)`.
  Serialize `SkillArea` with the kebab-case values above (`@JsonValue`).
- Validate the request with Bean Validation (`@NotNull @Size(min = 50, max = 100_000) String cvText`)
  and return the error shape above from a `@RestControllerAdvice`.
- Cache by SHA-256 of the trimmed CV text and never store the text itself.
- Keep all AI credentials on the server.
