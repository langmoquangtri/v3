# FireCMS hoàn chỉnh - lang-mo-cms

## File cần chép vào project

- `src/App.tsx`
- `src/firebase_config.ts`
- `src/collections/categories.tsx`
- `src/collections/products.tsx`
- `src/collections/projects.tsx`
- `src/collections/posts.tsx`
- `src/collections/banners.tsx`

Xóa hoặc bỏ dùng `src/collections/demo.tsx`.

## Chạy

```bash
cd firecms-admin
yarn install --ignore-platform
yarn dev
```

## Firebase

1. Authentication > Sign-in method > bật Email/Password.
2. Tạo ít nhất một user Email/Password trong Authentication > Users.
3. Firestore Database > Rules: dán nội dung `firestore.rules`, Publish.
4. Storage > Rules: dán nội dung `storage.rules`, Publish.

## Menu CMS

- Danh mục
- Sản phẩm
- Công trình
- Bài viết
- Banner
