# FireCMS + Cloudflare R2

Bản này giữ:
- Firebase Authentication: đăng nhập Email/Password
- Cloud Firestore: database CMS
- Cloudflare R2: toàn bộ ảnh
- FireCMS: giao diện quản trị

## Thông tin R2 đã cấu hình sẵn

- Bucket: `lang-mo-cms-images`
- Public URL: `https://pub-74197d4c4a464d7791ddee7a56de9461.r2.dev`
- Account ID: `967317fd3bd037bde6a23ae9eea91af8`

Không đưa R2 Access Key / Secret Key vào Vite hoặc GitHub. Worker dùng R2 Binding nên frontend không cần secret.

## 1. Deploy upload Worker

```bash
cd r2-upload-worker
npm install
npx wrangler login
npm run deploy
```

Sau khi deploy, Cloudflare trả URL dạng:

```text
https://lang-mo-cms-upload.<subdomain>.workers.dev
```

Kiểm tra:

```text
https://lang-mo-cms-upload.<subdomain>.workers.dev/health
```

phải trả:

```json
{"ok":true}
```

## 2. Cấu hình FireCMS

Tại thư mục `firecms-admin`, tạo `.env` từ `.env.example`:

```env
VITE_R2_API_BASE_URL=https://lang-mo-cms-upload.<subdomain>.workers.dev
VITE_R2_PUBLIC_BASE_URL=https://pub-74197d4c4a464d7791ddee7a56de9461.r2.dev
```

Sau đó restart Vite:

```bash
yarn dev
```

## 3. Bảo mật email upload (khuyến nghị)

Trong `r2-upload-worker/wrangler.jsonc`, đặt:

```json
"ALLOWED_EMAILS": "email-admin-cua-ban@example.com"
```

Có thể cho nhiều email, ngăn cách bằng dấu phẩy.

Worker kiểm tra Firebase ID token trước khi upload. Nếu `ALLOWED_EMAILS` để trống, mọi tài khoản Firebase Auth hợp lệ của project có thể upload.

## 4. CORS

Hiện dev dùng:

```json
"ALLOWED_ORIGINS": "*"
```

Vì URL Preview StackBlitz thay đổi. Khi deploy CMS thật, đổi thành domain admin thật, ví dụ:

```json
"ALLOWED_ORIGINS": "https://admin.example.com"
```

Nếu có nhiều origin, ngăn cách bằng dấu phẩy.

## 5. Collection

Tất cả trường ảnh đã thêm:

```ts
storeUrl: true
```

Vì vậy Firestore lưu URL public R2 đầy đủ. Frontend Next.js đọc trực tiếp URL ảnh, không cần nối prefix thủ công.

## 6. Không dùng Firebase Storage nữa

`App.tsx` đã bỏ `useFirebaseStorageSource` và thay bằng custom `StorageSource` cho R2.

Có thể bỏ qua hoàn toàn Firebase Storage.
