import { copyStep } from "../../lib.mjs";

export default {
  num: 26.3,
  code: "26.3",
  label: "יחידה 26.3",
  title: "ענן ו־Kubernetes: AWS, Kubernetes, Helm, Jenkins ו־Argo CD",
  part: "חטיבה ד׳ — רמת תעשייה",
  checker: true,
  database: true, // P26.3-E46: דוח עלויות ב־SQL
  testTimeout: 60000,
  time: "4 מפגשים",
  expectedExercises: 101,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Docker Desktop (פרק 23), ופרק 25 — ה־CI וה־deploy של פרויקט 2.</p>
<p><strong>מה מתקינים / מריצים עכשיו:</strong></p>
<ul>
<li><strong>LocalStack</strong> — אמולטור של AWS שרץ בקונטיינר: S3, SQS ו־IAM על המחשב שלך, בלי חשבון ובלי כרטיס אשראי (פעם אחת; אחר כך <code>docker start localstack</code>):
<pre class="mono">docker run -d --name localstack -p 4566:4566 -e SERVICES=s3,sqs,iam,sts localstack/localstack:4.14.0</pre>
הגרסה קבועה בכוונה: מגרסאות 2026 ואילך LocalStack דורש חשבון ו־auth token גם לשימוש החינמי. 4.14 עובדת בלי, ומספיקה לכל היחידה.</li>
<li>בדיקה: <code>curl http://localhost:4566/_localstack/health</code> ← <code>"s3": "available"</code> (או <code>"running"</code>).</li>
<li>ב־<code>~/dev/backend-course/.env</code>: <code>COURSE_AWS_ENDPOINT=http://localhost:4566</code>.</li>
<li><code>npm install</code> בתיקיית הקורס — מוסיף את <code>@aws-sdk/client-s3</code>, <code>@aws-sdk/client-sqs</code>, <code>@aws-sdk/s3-request-presigner</code> ו־<code>yaml</code>.</li>
<li>תוסף VS Code: <a href="https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools" target="_blank">Kubernetes</a> — השלמה ובדיקה של manifests בזמן הכתיבה (מגיע עם תוסף YAML של Red Hat).</li>
<li><strong>לא חובה — cluster אמיתי על המחשב:</strong> <a href="https://kind.sigs.k8s.io/docs/user/quick-start/" target="_blank">kind</a> (Kubernetes בתוך Docker), <a href="https://kubernetes.io/docs/tasks/tools/" target="_blank">kubectl</a> ו־<a href="https://helm.sh/docs/intro/install/" target="_blank">helm</a>. ב־Mac: <code>brew install kind kubectl helm</code>; ב־Windows: <code>winget install Kubernetes.kind Kubernetes.kubectl Helm.Helm</code>. הבודקים של היחידה <em>לא</em> צריכים cluster — הם קוראים את ה־YAML ובודקים אותו — אבל לראות pod עולה ונופל זה שווה את רבע השעה.</li>
</ul>
${copyStep("26c-cloud")}
<p><strong>✔ בדיקה:</strong> <code>cd ~/dev/backend-course && npm install && npm run check P26.3-E06</code> ← הבודק יוצר bucket ב־LocalStack ונכשל על הקובץ הריק. <code>ECONNREFUSED 127.0.0.1:4566</code> — הקונטיינר לא רץ.</p>`,
  goals: [
    "להכיר את המפה של AWS: מה רץ איפה (EKS/ECS, RDS, ElastiCache, S3, SQS, CloudFront) — ומה מקביל למה שכבר בנית.",
    "IAM: users, roles ו־policies, least privilege, וסדר ההחלטה Allow/Deny — ולכתוב policy שעוברת בדיקה.",
    "S3 מ־Node.js עם AWS SDK v3: JSON, pagination, וכתובות חתומות להעלאה ישירה — מול LocalStack.",
    "Kubernetes: Pod, Deployment, Service, ConfigMap, Secret, Ingress, Job, HPA — probes, resources ו־rolling update.",
    "Helm ו־GitOps עם Argo CD, ו־CI ב־Jenkins: הדרך של image מ־commit ועד cluster.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>בפרק 25 העלית את פרויקט 2 ל־Render: לוחצים, והשרת רץ. ככה עובדים הרבה סטארטאפים בהתחלה. אבל כשמודעת דרושים כותבת "AWS, Kubernetes (EKS), Jenkins, Argo CD" — היא מתארת חברה עם עשרות שירותים, מאות pods ותנועה גבוהה, שבה הפלטפורמה לא "קסם" אלא קוד: YAML ב־Git, pipelines, והרשאות מדויקות. ג׳וניור Backend לא מקים את ה־cluster לבד — אבל הוא כותב את ה־Deployment של השירות שלו, מבין למה ה־pod לא Ready, מבקש הרשאת IAM מדויקת, ומעדכן גרסה דרך pull request ל־repo התצורה. את כל זה נעשה כאן — עם AWS אמיתי־למחצה (LocalStack) ובודקים שקוראים את ה־manifests כמו ש־Kubernetes קורא.</p>`,
  lessons: [
    { file: "lesson-01-aws.html", title: "המפה של AWS: מה רץ איפה", minutes: 40 },
    { file: "lesson-02-iam-s3.html", title: "IAM, ה־SDK ו־S3", minutes: 50 },
    { file: "lesson-03-kubernetes.html", title: "Kubernetes: Pods, Deployments ו־Services", minutes: 55 },
    { file: "lesson-04-helm-gitops.html", title: "Helm ו־GitOps עם Argo CD", minutes: 45 },
    { file: "lesson-05-jenkins.html", title: "Jenkins, והדרך המלאה מ־commit ל־cluster", minutes: 45 },
  ],
  glossary: [
    ["AWS", "אֵיי־דַבְּלְיוּ־אֶס", "Amazon Web Services — ספק הענן הגדול בעולם"],
    ["Region / AZ", "רִיגְ׳ן / אֵיי־זִי", "אזור גאוגרפי (eu-central-1) / מרכז נתונים נפרד בתוכו"],
    ["IAM", "אַיי־אֶם", "ניהול זהויות והרשאות ב־AWS: users, roles, policies"],
    ["Role", "רוֹל", "זהות בלי סיסמה קבועה, ששירות \"לובש\" ומקבל credentials זמניים"],
    ["ARN", "אַרְן", "המזהה הייחודי של משאב ב־AWS: arn:aws:s3:::bucket/key"],
    ["S3", "אֶס־תְּרִי", "אחסון אובייקטים: bucket + key ← קובץ"],
    ["Presigned URL", "פְּרִי־סַיינְד יוּ־אַר־אֶל", "כתובת חתומה וזמנית שמרשה פעולה אחת על אובייקט"],
    ["LocalStack", "לוֹקַל־סְטַאק", "אמולטור של AWS שרץ ב־Docker"],
    ["Kubernetes (K8s)", "קוּבֶּרְנֶטִיס", "מערכת שמריצה קונטיינרים על הרבה מכונות ושומרת על מצב רצוי"],
    ["Pod", "פּוֹד", "יחידת הריצה הקטנה: קונטיינר אחד (או כמה) עם IP משותף"],
    ["Deployment", "דִיפְּלוֹימֶנְט", "\"N עותקים של ה־pod הזה\" — כולל rolling update ו־rollback"],
    ["Service", "סֶרְוִויס", "שם ו־IP יציבים שמחלקים תנועה בין pods"],
    ["Ingress", "אִינְגְרֶס", "הכניסה מבחוץ: host ← Service, עם TLS"],
    ["Probe", "פְּרוֹבּ", "בדיקה שה־kubelet מריץ: readiness (לשלוח תנועה?) ו־liveness (להפעיל מחדש?)"],
    ["HPA", "אֵייץ׳־פִּי־אֵיי", "Horizontal Pod Autoscaler — מוסיף ומוריד עותקים לפי מדד"],
    ["Helm", "הֶלְם", "מנהל חבילות ל־Kubernetes: templates + values ← manifests"],
    ["GitOps", "גִיט־אוֹפְּס", "Git הוא המקור של מה שרץ; כלי במחלקה מסנכרן את ה־cluster אליו"],
    ["Argo CD", "אַרְגוֹ סִי־דִי", "כלי GitOps שרץ בתוך ה־cluster ומושך שינויים מ־Git"],
    ["Jenkins", "גֶ׳נְקִינְס", "שרת CI ותיק ונפוץ; pipelines כ־Jenkinsfile"],
  ],
  passTest: `<ul class="check">
<li>לבחור שירות AWS לכל רכיב של המערכת, ולהסביר role מול access key.</li>
<li>לכתוב IAM policy מצומצמת, ולהסביר למה Deny מפורש מנצח.</li>
<li>לעבוד עם S3 מ־Node.js: JSON, pagination, וכתובת חתומה להעלאה.</li>
<li>לכתוב Deployment, Service, ConfigMap, Ingress ו־HPA — ולהסביר readiness מול liveness ו־requests מול limits.</li>
<li>להסביר את הדרך של שינוי מ־commit, דרך Jenkins ו־repo התצורה, עד rolling update ב־Argo CD.</li>
<li><code>npm run check P26.3</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
