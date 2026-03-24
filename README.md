# Học Từ Thiện - Charity Learning Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.11-2D3748?style=flat-square&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Nền tảng kết nối Mentor và Mentee với mục đích từ thiện**

[Demo](https://hoctuthien.space.z.ai) · [Báo cáo lỗi](https://github.com/dvchd/hoctuthien-zai/issues) · [Tính năng](#tính-năng)

</div>

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Kiến trúc](#kiến-trúc)
- [Công nghệ](#công-nghệ)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Đóng góp](#đóng-góp)
- [License](#license)

---

## Giới thiệu

**Học Từ Thiện** là một nền tảng học trực tuyến kết nối những người muốn chia sẻ kiến thức (Mentor) với những người muốn học hỏi (Mentee). Điểm đặc biệt là tất cả các khoản thanh toán đều được quyên góp cho mục đích từ thiện thông qua **Thiện Nguyện App** của MBBank.

### Mục tiêu

- Tạo cơ hội học tập bình đẳng cho mọi người
- Kết nối cộng đồng chia sẻ kiến thức
- Hỗ trợ các hoạt động từ thiện thông qua giáo dục
- Xây dựng một hệ sinh thái học tập bền vững

---

## Tính năng

### Đã hoàn thành

- **Xác thực Google OAuth**: Đăng nhập nhanh chóng và an toàn với tài khoản Google
- **Phân quyền người dùng**: Hệ thống 3 role chính (Admin, Mentor, Mentee)
- **Quản lý Profile Mentor**: Cập nhật thông tin chuyên môn và lịch trình
- **Tìm kiếm Mentor**: Tìm kiếm theo lĩnh vực, kỹ năng, đánh giá
- **Kích hoạt tài khoản Mentee**: Thanh toán 10.000 VND để kích hoạt
- **Tích hợp VietQR**: Tạo mã QR động cho thanh toán
- **Tích hợp Thiện Nguyện App API**: Xác thực giao dịch tự động

### Đang phát triển

- **Đặt lịch hẹn**: Booking system cho các buổi mentoring
- **Tích hợp Google Meet**: Tự động tạo meeting link
- **Hệ thống đánh giá**: Review và rating sau mỗi buổi học
- **Leaderboard**: Bảng xếp hạng Mentor và Mentee
- **Dashboard Admin**: Quản lý người dùng và giao dịch

---

## Kiến trúc

Dự án được xây dựng theo kiến trúc **Domain-Driven Design (DDD)** kết hợp với **Clean Architecture**, đảm bảo tính module hóa, dễ bảo trì và mở rộng.

### Sơ đồ kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Next.js App Router (Pages, Layouts, Components)           ││
│  │  - React 19 + TypeScript                                   ││
│  │  - TailwindCSS v4 + shadcn/ui                              ││
│  │  - Server Components + Client Components                    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Use Cases (Business Logic)                                ││
│  │  - AuthUseCase: Google OAuth, Session Management            ││
│  │  - UserUseCase: User CRUD, Profile Management               ││
│  │  - MentorUseCase: Mentor Management, Search                 ││
│  │  - PaymentUseCase: Activation, Transaction Verification     ││
│  │  - SessionUseCase: Booking, Scheduling                      ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  DTOs (Data Transfer Objects)                              ││
│  │  Value Objects, Utilities                                   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DOMAIN LAYER                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Entities                                                  ││
│  │  - UserEntity: Core user business logic                     ││
│  │  - BaseEntity: Base with audit, soft delete, versioning     ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Value Objects                                             ││
│  │  - Email: Email validation & encapsulation                   ││
│  │  - UserRole: Role types (ADMIN, MENTOR, MENTEE)             ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Repository Interfaces                                     ││
│  │  - IUserRepository: User persistence contract               ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Domain Errors                                             ││
│  │  - EntityNotFoundError, OptimisticConcurrencyError          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Repository Implementations                                ││
│  │  - UserRepository: Prisma-based implementation              ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  External Services                                         ││
│  │  - VietQRService: QR code generation                        ││
│  │  - ThienNguyenAPI: Transaction verification                 ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Unit of Work Pattern                                      ││
│  │  - Transaction management across repositories               ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATABASE                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  SQLite (Development) / PostgreSQL (Production)             ││
│  │  Prisma ORM                                                 ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Design Patterns sử dụng

| Pattern | Mục đích |
|---------|----------|
| **Repository Pattern** | Tách biệt logic truy cập dữ liệu khỏi business logic |
| **Unit of Work** | Quản lý transaction nhất quán across repositories |
| **Value Object** | Đóng gói các giá trị có validation (Email, Role) |
| **Entity** | Đối tượng có identity và lifecycle riêng |
| **Dependency Injection** | Giảm coupling giữa các layer |
| **Factory Method** | Tạo entity từ các nguồn khác nhau (Google OAuth) |

---

## Công nghệ

### Frontend

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| [Next.js](https://nextjs.org/) | 16.1.1 | React framework với App Router |
| [React](https://react.dev/) | 19.0 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.0 | Type-safe JavaScript |
| [TailwindCSS](https://tailwindcss.com/) | 4.0 | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | Latest | Component library |
| [Lucide Icons](https://lucide.dev/) | Latest | Icon library |
| [Framer Motion](https://www.framer.com/motion/) | 12.x | Animation library |

### Backend

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| [NextAuth.js](https://next-auth.js.org/) | 4.24 | Authentication |
| [Prisma](https://www.prisma.io/) | 6.11 | ORM |
| [SQLite](https://www.sqlite.org/) | - | Database (dev) |
| [Zod](https://zod.dev/) | 4.0 | Schema validation |

### Testing

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| [Vitest](https://vitest.dev/) | 4.1 | Test runner |
| [React Testing Library](https://testing-library.com/react) | 16.x | React testing |
| [Happy DOM](https://github.com/capricorn86/happy-dom) | 20.x | DOM environment |

### External APIs

| API | Mô tả |
|-----|-------|
| [VietQR](https://vietqr.io/) | Tạo mã QR thanh toán ngân hàng |
| [Thiện Nguyện App](https://thiennguyen.app/) | API xác thực giao dịch từ thiện MBBank |
| [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) | Xác thực người dùng |

---

## Cài đặt

### Yêu cầu hệ thống

- Node.js >= 18.0.0
- Bun hoặc npm/yarn/pnpm
- Git

### Các bước cài đặt

1. **Clone repository**

```bash
git clone https://github.com/dvchd/hoctuthien-zai.git
cd hoctuthien-zai
```

2. **Cài đặt dependencies**

```bash
# Sử dụng Bun (khuyến nghị)
bun install

# Hoặc sử dụng npm
npm install
```

3. **Tạo file môi trường**

```bash
cp .env.example .env
```

4. **Cấu hình biến môi trường** (xem phần [Cấu hình](#cấu-hình))

5. **Khởi tạo database**

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# (Optional) Seed data
bun run db:seed
```

6. **Chạy development server**

```bash
bun run dev
```

7. **Mở trình duyệt**

Truy cập [http://localhost:3000](http://localhost:3000)

---

## Cấu hình

### Biến môi trường

Tạo file `.env` trong thư mục gốc với nội dung sau:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-here-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Lấy từ Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# MBBank Charity Account
MBBANK_ACCOUNT="your-charity-account-number"
MBBANK_ACCOUNT_NAME="TEN TAI KHOAN TU THIEN"

# Optional: Skip Thiện Nguyện API in development
SKIP_THIENNGUYEN_API="true"
```

### Cấu hình Google OAuth

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Credentials**
4. Tạo **OAuth 2.0 Client ID** loại **Web application**
5. Thêm Authorized JavaScript origins:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
6. Thêm Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
7. Copy Client ID và Client Secret vào `.env`

### Cấu hình Production

```env
# Database (PostgreSQL推荐)
DATABASE_URL="postgresql://user:password@host:5432/hoctuthien?schema=public"

# NextAuth
NEXTAUTH_SECRET="production-secret-key-min-32-characters-long"
NEXTAUTH_URL="https://your-domain.com"

# Google OAuth (cập nhật redirect URI trong Google Console)
GOOGLE_CLIENT_ID="production-client-id"
GOOGLE_CLIENT_SECRET="production-client-secret"
```

---

## Cấu trúc dự án

```
hoctuthien-zai/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API Routes
│   │   │   ├── activation/  # Activation endpoint
│   │   │   ├── auth/        # NextAuth routes
│   │   │   ├── mentor/      # Mentor API
│   │   │   ├── mentors/     # Mentors listing API
│   │   │   ├── sessions/    # Sessions API
│   │   │   └── teaching-fields/ # Teaching fields API
│   │   ├── activation/      # Activation page
│   │   ├── become-mentor/   # Become mentor page
│   │   ├── dashboard/       # Dashboard layout
│   │   ├── login/           # Login page
│   │   ├── mentor/          # Mentor profile
│   │   ├── mentors/         # Mentors listing
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Homepage
│   │   └── globals.css      # Global styles
│   ├── application/         # Application Layer
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── use-cases/       # Business Use Cases
│   │   ├── utils/           # Application utilities
│   │   └── __tests__/       # Application tests
│   ├── components/          # React Components
│   │   ├── auth/            # Auth components
│   │   └── ui/              # UI components (shadcn)
│   ├── domain/              # Domain Layer
│   │   ├── entities/        # Domain Entities
│   │   ├── errors/          # Domain Errors
│   │   ├── events/          # Domain Events
│   │   ├── repositories/    # Repository Interfaces
│   │   ├── value-objects/   # Value Objects
│   │   └── __tests__/       # Domain tests
│   ├── hooks/               # React Hooks
│   ├── infrastructure/      # Infrastructure Layer
│   │   ├── external/        # External APIs
│   │   │   ├── viet-qr.ts   # VietQR integration
│   │   │   └── thien-nguyen-api.ts # Thiện Nguyện API
│   │   ├── repositories/    # Repository Implementations
│   │   ├── unit-of-work/    # Unit of Work
│   │   └── __tests__/       # Infrastructure tests
│   ├── lib/                 # Library utilities
│   │   ├── auth/            # Auth utilities
│   │   ├── constants.ts     # App constants
│   │   ├── db.ts            # Prisma client
│   │   └── utils.ts         # General utilities
│   └── test/                # Test utilities
├── .env.example             # Environment template
├── package.json             # Dependencies
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── vitest.config.ts         # Test configuration
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│     User     │────<│ MentorTeaching   │>────│ TeachingField│
│              │     │     Field        │     │              │
│ - id         │     │                  │     │ - id         │
│ - email      │     │ - mentorId       │     │ - name       │
│ - googleId   │     │ - teachingFieldId│     │ - slug       │
│ - name       │     │ - experienceLevel│     │ - icon       │
│ - role       │     └──────────────────┘     └──────────────┘
│ - status     │
│ - activation │     ┌──────────────────┐     ┌──────────────┐
│   Code       │────<│ SessionMentoring │>────│    User      │
└──────────────┘     │                  │     │  (Mentor)    │
      │              │ - mentorId       │     └──────────────┘
      │              │ - menteeId       │
      │              │ - scheduledAt    │     ┌──────────────┐
      │              │ - meetingLink    │     │   Mentor     │
      │              │ - amount         │     │  Profile     │
      │              │ - status         │     │              │
      │              └──────────────────┘     │ - title      │
      │                                       │ - company    │
      │              ┌──────────────────┐     │ - hourlyRate │
      └─────────────>│PaymentTransaction│     │ - charityAcct│
                     │                  │     └──────────────┘
                     │ - userId         │
                     │ - type           │     ┌──────────────┐
                     │ - amount         │     │   Mentee     │
                     │ - paymentCode    │     │  Profile     │
                     │ - status         │     │              │
                     └──────────────────┘     │ - learning   │
                                              │   Goals      │
                                              └──────────────┘
```

### Các bảng chính

| Bảng | Mô tả |
|------|-------|
| **User** | Người dùng hệ thống (Admin, Mentor, Mentee) |
| **MentorProfile** | Thông tin chi tiết Mentor |
| **MenteeProfile** | Thông tin chi tiết Mentee |
| **TeachingField** | Lĩnh vực giảng dạy |
| **MentorTeachingField** | Quan hệ Mentor - Teaching Field |
| **SessionMentoring** | Buổi học giữa Mentor và Mentee |
| **PaymentTransaction** | Giao dịch thanh toán |
| **Leaderboard** | Bảng xếp hạng |
| **AuditLog** | Nhật ký hoạt động |

### Enums

```typescript
enum UserRole {
  ADMIN      // Quản trị viên
  MENTOR     // Người hướng dẫn
  MENTEE     // Người học
}

enum UserStatus {
  ACTIVE               // Đang hoạt động
  INACTIVE             // Không hoạt động
  SUSPENDED            // Bị khóa
  PENDING_VERIFICATION // Chờ xác thực
  PENDING_ACTIVATION   // Chờ kích hoạt (chưa thanh toán 10k)
}

enum SessionStatus {
  PENDING_PAYMENT  // Chờ thanh toán
  SCHEDULED        // Đã lên lịch
  COMPLETED        // Hoàn thành
  CANCELLED        // Đã hủy
  NO_SHOW          // Không tham gia
}

enum TransactionType {
  ACTIVATION       // Kích hoạt tài khoản
  SESSION_PAYMENT  // Thanh toán buổi học
  DONATION         // Quyên góp
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/auth/signin` | Trang đăng nhập |
| GET | `/api/auth/callback/google` | Callback Google OAuth |
| POST | `/api/auth/signout` | Đăng xuất |

### Users

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/auth/session` | Lấy session hiện tại | - |
| GET | `/api/mentors` | Danh sách Mentor | - |
| GET | `/api/mentors/:id` | Chi tiết Mentor | - |
| PUT | `/api/mentor/profile` | Cập nhật profile Mentor | Mentor |

### Activation

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/activation` | Lấy thông tin kích hoạt | Mentee |
| POST | `/api/activation` | Xác nhận đã chuyển khoản | Mentee |

### Sessions

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/sessions` | Danh sách sessions | User |
| POST | `/api/sessions` | Tạo session mới | Mentee |
| PUT | `/api/sessions/:id` | Cập nhật session | User |

### Teaching Fields

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| GET | `/api/teaching-fields` | Danh sách lĩnh vực | - |

### Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... }
}

// Error Response
{
  "success": false,
  "error": "Error message"
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

## Testing

### Chạy tests

```bash
# Chạy tất cả tests
bun run test

# Chạy tests với coverage
bun run test:coverage

# Chạy tests một lần (CI)
bun run test:run

# Chạy tests với UI
bun run test:ui
```

### Cấu trúc tests

```
src/
├── __tests__/
│   ├── domain/           # Domain entity tests
│   │   ├── base.entity.test.ts
│   │   ├── user.entity.test.ts
│   │   ├── email.vo.test.ts
│   │   └── role.vo.test.ts
│   ├── application/      # Application layer tests
│   │   └── payment-code.test.ts
│   ├── infrastructure/   # Infrastructure tests
│   │   └── viet-qr.test.ts
│   └── api/              # API endpoint tests
│       └── activation.test.ts
└── test/
    ├── setup.ts          # Test setup
    └── utils.tsx         # Test utilities
```

### Test Coverage

Dự án hiện có **178+ unit tests** bao phủ:

- **Domain Layer**: Entity logic, Value Objects validation
- **Application Layer**: Use cases, Payment code generation
- **Infrastructure Layer**: VietQR service, Repository implementations
- **API Layer**: Endpoint testing với mocked dependencies

---

## Deployment

### Vercel (Khuyến nghị)

1. Push code lên GitHub
2. Import project vào [Vercel](https://vercel.com)
3. Cấu hình environment variables
4. Deploy

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build và run
docker build -t hoctuthien .
docker run -p 3000:3000 hoctuthien
```

### Self-hosted

```bash
# Build
bun run build

# Start production server
bun run start
```

---

## Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp! Vui lòng làm theo các bước sau:

### Quy trình đóng góp

1. **Fork** repository
2. **Tạo branch** cho feature/bugfix:
   ```bash
   git checkout -b feature/ten-feature-moi
   # hoặc
   git checkout -b fix/ten-bug-can-fix
   ```
3. **Commit** với message rõ ràng:
   ```bash
   git commit -m "feat: thêm tính năng X"
   # hoặc
   git commit -m "fix: sửa lỗi Y"
   ```
4. **Push** lên branch:
   ```bash
   git push origin feature/ten-feature-moi
   ```
5. Tạo **Pull Request**

### Coding Standards

- Sử dụng **TypeScript** strict mode
- Tuân thủ **ESLint** rules
- Viết **tests** cho code mới
- Tuân thủ **DDD architecture**
- Comment code bằng **Tiếng Việt** hoặc **Tiếng Anh**

### Commit Convention

```
feat: Thêm tính năng mới
fix: Sửa lỗi
docs: Cập nhật documentation
style: Format code, không thay đổi logic
refactor: Refactor code
test: Thêm/cập nhật tests
chore: Cấu hình, dependencies
```

---

## License

Dự án được phân phối dưới **MIT License**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## Liên hệ

- **GitHub**: [https://github.com/dvchd/hoctuthien-zai](https://github.com/dvchd/hoctuthien-zai)
- **Demo**: [https://hoctuthien.space.z.ai](https://hoctuthien.space.z.ai)
- **Issues**: [https://github.com/dvchd/hoctuthien-zai/issues](https://github.com/dvchd/hoctuthien-zai/issues)

---

<div align="center">

**Made with ❤️ by the Học Từ Thiện Team**

</div>
