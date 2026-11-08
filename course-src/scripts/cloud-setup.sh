#!/usr/bin/env bash
# הכנת סביבת אימות בענן/לינוקס (Claude Code on the web וכדומה).
# במק אין צורך — build.mjs משתמש ב־/Library/PostgreSQL/18 ו־course-src/.pgdata.
# מה זה עושה: מפעיל Docker, מריץ PostgreSQL 18 בקונטיינר course-pg על פורט 5433 ו־Redis 8 ב־course-redis על 6380
# (trust, אזור זמן Asia/Jerusalem), מעתיק ממנו psql 18 ל־/opt/pg18, מתקין Node 24 ל־/opt/node24, ומתקין את התלויות.
# אחר כך מריצים את הבנייה עם Node 24 (כמו אצל הלומד; פרק 22 דורש אותו):
#   PATH=/opt/node24/bin:$PATH node course-src/build.mjs --verify
set -euo pipefail
cd "$(dirname "$0")/.."
if ! docker info >/dev/null 2>&1; then (nohup dockerd >/tmp/dockerd.log 2>&1 &); for i in $(seq 90); do docker info >/dev/null 2>&1 && break; sleep 1; done; fi
docker start course-pg >/dev/null 2>&1 || docker run -d --name course-pg -p 5433:5432 \
  -e POSTGRES_HOST_AUTH_METHOD=trust -e TZ=Asia/Jerusalem postgres:18 -c timezone=Asia/Jerusalem >/dev/null
# פרק 23: בענן, HTTPS יוצא עובר דרך proxy עם תעודה משלו — npm בתוך קונטיינר נכשל ("self-signed certificate").
# בונים כאן (רק בסביבה הזו!) node:24-alpine מקומי שסומך על התעודה. ה־Dockerfiles של הקורס לא משתנים.
if [ -f /root/.ccr/ca-bundle.crt ] && ! docker run --rm node:24-alpine test -f /usr/local/share/proxy-ca.crt 2>/dev/null; then
  ca=$(mktemp -d); cp /root/.ccr/ca-bundle.crt "$ca/proxy-ca.crt"
  printf 'FROM node:24-alpine\nCOPY proxy-ca.crt /usr/local/share/proxy-ca.crt\nRUN cat /usr/local/share/proxy-ca.crt >> /etc/ssl/certs/ca-certificates.crt\nENV NODE_EXTRA_CA_CERTS=/usr/local/share/proxy-ca.crt\n' > "$ca/Dockerfile"
  docker pull -q node:24-alpine >/dev/null && docker build -q -t node:24-alpine "$ca" >/dev/null
fi
docker pull -q postgres:18-alpine >/dev/null 2>&1 || true
# פרק 26: Redis 8 בקונטיינר course-redis על פורט 6380 (לא 6379 — כדי לא להתנגש ב־Redis של הלומד)
docker start course-redis >/dev/null 2>&1 || docker run -d --name course-redis -p 6380:6379 redis:8-alpine >/dev/null
# יחידה 19.5: MySQL 8.4 בקונטיינר course-mysql על פורט 3307 (root בלי סיסמה — רק בסביבת האימות)
docker start course-mysql >/dev/null 2>&1 || docker run -d --name course-mysql -p 3307:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=yes mysql:8.4 >/dev/null
# יחידה 25.5: LocalStack (אמולטור של AWS — S3, SQS, IAM) על 4566
docker start course-localstack >/dev/null 2>&1 || docker run -d --name course-localstack -p 4566:4566 -e SERVICES=s3,sqs,iam,sts localstack/localstack:4.14.0 >/dev/null
# יחידה 26.5: RabbitMQ על 5673, Kafka (KRaft, broker אחד) על 9095
docker start course-rabbit >/dev/null 2>&1 || docker run -d --name course-rabbit -p 5673:5672 rabbitmq:4-alpine >/dev/null
docker start course-kafka >/dev/null 2>&1 || docker run -d --name course-kafka -p 9095:9092 \
  -e KAFKA_NODE_ID=1 -e KAFKA_PROCESS_ROLES=broker,controller \
  -e KAFKA_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9095 \
  -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
  -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  -e KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1 -e KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1 \
  -e KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS=0 -e KAFKA_NUM_PARTITIONS=3 apache/kafka:4.1.0 >/dev/null
if [ ! -x /opt/pg18/bin/psql ]; then
  mkdir -p /opt/pg18img/lib /opt/pg18/bin
  docker cp course-pg:/usr/lib/postgresql/18 /opt/pg18img/
  for f in $(docker exec course-pg sh -c 'ls /usr/lib/x86_64-linux-gnu/libpq.so*'); do docker cp -L "course-pg:$f" /opt/pg18img/lib/; done
  for b in psql pg_isready pg_dump; do
    printf '#!/bin/sh\nLD_LIBRARY_PATH=/opt/pg18img/lib exec /opt/pg18img/18/bin/%s "$@"\n' "$b" > /opt/pg18/bin/$b; chmod +x /opt/pg18/bin/$b
  done
fi
if [ ! -x /opt/node24/bin/node ]; then
  file=$(curl -fsSL https://nodejs.org/dist/latest-v24.x/SHASUMS256.txt | grep -o 'node-v24[^ ]*-linux-x64.tar.xz' | head -1)
  curl -fsSL "https://nodejs.org/dist/latest-v24.x/$file" | tar xJ -C /opt && mv "/opt/${file%.tar.xz}" /opt/node24
fi
/opt/node24/bin/node -v
[ -d node_modules ] || npm ci --no-audit --no-fund
for i in $(seq 30); do /opt/pg18/bin/pg_isready -q -h localhost -p 5433 && break; sleep 1; done
/opt/pg18/bin/pg_isready -h localhost -p 5433
for i in $(seq 90); do docker exec course-mysql mysqladmin ping -s >/dev/null 2>&1 && break; sleep 1; done
