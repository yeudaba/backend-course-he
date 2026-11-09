# events-platform

מערכת קליטה ואנליטיקה של אירועי מוצר (צפייה, הוספה לעגלה, רכישה) — לכמה לקוחות (tenants), בנפח גבוה.

```
לקוח ── POST /v1/events ──▶ ingest ──▶ Kafka (events) ──▶ processor ──▶ MySQL
                                                                       │
                                     query API ◀── DuckDB ◀── lake (Parquet) ◀── export (CronJob)
                                         │
                                  GET /v1/stats/daily · GET /v1/funnel   (+ עוזר אנליטיקה, רשות)
```

## החלטות
- **קליטה מהירה, עיבוד אסינכרוני:** ingest רק מאמת ושולח ל־Kafka (מחזיר 202 אחרי אישור של ה־broker). key = `tenant:user` — הסדר נשמר לכל משתמש.
- **פעם אחת בדיוק — במסד:** Kafka נותן at-least-once; `UNIQUE (tenant_id, event_id)` + `INSERT IGNORE` הופכים כפילויות לחסרות השפעה. האגרגציות באותה טרנזקציה עם האירוע; commit ל־Kafka אחרי ה־COMMIT במסד.
- **OLTP מול OLAP:** סטטיסטיקה יומית מטבלאות מסוכמות ב־MySQL (מהיר, עדכני); משפכים — מה־lake העמודתי עם DuckDB.
- **ימים בשעון ישראל**, זמנים ב־UTC.

## הרצה מקומית
```bash
docker compose up -d   # MySQL 8.4, Kafka 4.1
npm ci
mysql -h127.0.0.1 -uroot -p < migrations/001_init.sql
API_KEYS=dev-key-0123456789:acme MYSQL_URL=mysql://root:dev@localhost:3306/events KAFKA_BROKERS=localhost:9092 npm run ingest
```

## פריסה
`k8s/platform.yaml` — ingest (3–20 עם HPA), processor (עד 6, כמספר ה־partitions), export (CronJob כל 15 דקות), query, Ingress עם TLS. ה־Secret `events-secrets` נוצר מחוץ ל־Git.
