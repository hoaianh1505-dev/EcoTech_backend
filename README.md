# 🔧 EcoTech Backend API

REST API cho website thương mại điện tử EcoTech.

## Công nghệ
- **Runtime**: Node.js v18+ (ES6 Modules)
- **Framework**: Express.js
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Auth**: JWT (Access + Refresh Token)
- **Upload**: AWS S3
- **Thanh toán**: PayPal REST API
- **Validation**: express-validator
- **Docs**: Swagger / OpenAPI

## Cài đặt

```bash
# Clone repo
git clone <repo-url>
cd EcoTech_backend

# Cài dependencies
npm install

# Tạo file .env
cp .env.example .env

# Chạy migration
npx typeorm migration:run -d src/config/data-source.js

# Chạy dev server
npm run dev
```

## API Docs
Truy cập: `http://localhost:5000/api-docs`

## Scripts
| Lệnh | Mô tả |
|-------|--------|
| `npm run dev` | Chạy dev server (nodemon) |
| `npm start` | Chạy production |
| `npm test` | Chạy unit tests |
