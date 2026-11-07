# יוצר את chapters/15p-project-tasks/reference.html מקובצי הפתרון (להריץ אחרי כל שינוי בפתרון)
import os
here = os.path.join(os.path.dirname(__file__), "..", "chapters", "15p-project-tasks")
base = os.path.join(here, "solutions", "tasks-api")
files = ["src/tasks/tasks.schema.ts", "src/tasks/tasks.repository.ts", "src/tasks/tasks.service.ts", "src/tasks/tasks.routes.ts", "src/middleware/validate.ts", "src/errors.ts", "src/app.ts"]
head = open(os.path.join(here, "reference-head.html")).read()
out = [head]
for f in files:
    code = open(os.path.join(base, f)).read().rstrip("\n")
    out.append(f"\n  <h2>{f}</h2>\n```ts file={f}\n{code}\n```\n")
open(os.path.join(here, "reference.html"), "w").write("".join(out))
