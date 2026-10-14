# ขั้น build: ติดตั้ง dependency และสร้างไฟล์เว็บสำหรับ production
FROM node:24-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /app

# CallMapEmbed ใช้โมดูล Navigation จาก IndoorNav/frontend จึงต้องคงโครงสร้าง
# สองโฟลเดอร์นี้ไว้เหมือนตอน build บนเครื่อง และสั่ง build จากราก repository
COPY pj-frontend ./pj-frontend
COPY IndoorNav/frontend ./IndoorNav/frontend

WORKDIR /app/pj-frontend
RUN pnpm install --frozen-lockfile

# โมดูล Navigation อยู่นอก pj-frontend: ให้ Node มองเห็น dependency ชุดเดียวกัน
# และรองรับชื่อ Types.ts ที่ macOS ไม่แยกตัวพิมพ์ แต่ Linux แยกตัวพิมพ์
RUN ln -s /app/pj-frontend/node_modules /app/node_modules \
    && cp /app/IndoorNav/frontend/src/Types.ts /app/IndoorNav/frontend/src/types.ts

RUN pnpm run build

# ขั้น production: ใช้ Nginx ให้บริการไฟล์เว็บและส่ง /api ไปยัง Backend
FROM nginx:1.31.2-alpine AS production

ENV NGINX_PORT=6000
COPY ./pj-frontend/nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY --from=builder /app/pj-frontend/dist /usr/share/nginx/html

EXPOSE 6000
