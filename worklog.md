# Học Từ Thiện - Worklog

---
Task ID: 1
Agent: Main Agent
Task: Triển khai dự án Học Từ Thiện với Google OAuth, DDD Architecture

Work Log:
- Thiết lập Prisma Schema với đầy đủ entities: User, MentorProfile, MenteeProfile, SessionMentoring, Transaction, AuditLog
- Implement Audit Entity với các fields: createdAt, updatedAt, createdBy, updatedBy
- Implement Soft Delete với: isDeleted, deletedAt, deletedBy
- Implement Versioning (Optimistic Concurrency) với: version
- Tạo cấu trúc thư mục DDD/Clean Architecture:
  - domain/ (entities, value-objects, repositories, errors)
  - application/ (use-cases, dto)
  - infrastructure/ (repositories, unit-of-work)
- Tạo Domain Layer:
  - BaseEntity với audit, soft delete, versioning
  - UserEntity với đầy đủ business logic
  - Value Objects: UserRole, Email
  - Repository Interfaces: IUserRepository
  - Domain Errors: EntityNotFoundError, OptimisticConcurrencyError, etc.
- Tạo Infrastructure Layer:
  - UserRepository implementation với Prisma
  - Unit of Work pattern
- Tạo Application Layer:
  - AuthUseCase: handleGoogleLogin, getCurrentUser, validateUser
  - UserUseCase: getUserById, listUsers, updateProfile, changeUserRole, deleteUser, restoreUser
- Thiết lập NextAuth.js với Google OAuth Provider
- Tạo UI components:
  - LoginForm với Google OAuth button
  - SiteHeader với role-based navigation
  - SiteFooter
  - Landing page với hero section, features
  - Dashboard cho Admin, Mentor, Mentee với stats và quick actions
- Tạo auth hooks và utilities:
  - useAuth hook cho client components
  - getAuthSession, getCurrentUser cho server components
  - RoleGuard, AdminOnly, MentorOnly components

Stage Summary:
- Dự án Next.js 16 với App Router đã được thiết lập
- Google OAuth authentication hoàn chỉnh
- DDD/Clean Architecture với Repository Pattern, Unit of Work
- Audit Entity, Versioning, Soft Delete đầy đủ
- Role-based access control (Admin, Mentor, Mentee)
- UI components với TailwindCSS và shadcn/ui
- Responsive design cho mobile và desktop
- Dashboard riêng cho từng role

---
Task ID: 2
Agent: Payment Service Agent
Task: Xây dựng Charity Service và Payment Service

Work Log:
- Tạo ThienNguyenAPI class (`/src/infrastructure/external/thien-nguyen-api.ts`):
  - Method `getTransactions(accountNo, fromDate, toDate, keyword)` để lấy giao dịch từ Thiện Nguyện App API
  - API endpoint: `apiv2.thiennguyen.app/api/v2/bank-account-transaction/{accountNo}/transactionsV2`
  - Xử lý timezone Việt Nam (UTC+7) không có timezone info trong response
  - Method `findTransactionByPaymentCode()` để tìm giao dịch theo mã thanh toán
  - Method `findTransactionByAmount()` để tìm giao dịch theo số tiền

- Tạo VietQRService class (`/src/infrastructure/external/viet-qr.ts`):
  - Method `generateQRCodeUrl()` tạo URL hình ảnh QR động
  - VietQR format: `https://img.vietqr.io/image/{bank}-{accountNo}-qr_only.png?amount={amount}&addInfo={content}&accountName={accountName}`
  - Method `generateDeepLink()` tạo deep link cho app ngân hàng
  - Method `generateMBBankDeepLink()` chuyên biệt cho MB Bank app
  - Hỗ trợ nhiều template QR: qr_only, compact, print

- Tạo Payment Code Generator (`/src/application/utils/payment-code.ts`):
  - Function `generateActivationCode()` tạo mã kích hoạt 6 chữ cái HO (VD: ABCXYZ)
  - Function `generatePaymentCode(prefix)` tạo mã thanh toán với prefix (VD: HOCPHIBCDEFG)
  - Chỉ dùng chữ cái A-Z (không dùng số) để tránh bị ẩn bởi Thiện Nguyện App
  - Prefix constants: KICHHOAT, HOCPHI, QUYENGOP

- Tạo Charity DTOs (`/src/application/dto/charity.dto.ts`):
  - `IThienNguyenTransactionDto` - giao dịch từ Thiện Nguyện App
  - `IVerifyPaymentDto` - request verify payment
  - `IPaymentVerificationResult` - kết quả verify
  - `IRequestActivationDto`, `IActivationRequestResult`, `IActivationVerificationResult`
  - `IRequestSessionPaymentDto`, `ISessionPaymentRequestResult`, `ISessionPaymentVerificationResult`
  - `IQrCodeOptionsDto`, `IQrCodeResultDto`
  - `IPaymentTransactionDto`, `IPaymentStatsDto`

- Tạo PaymentUseCase (`/src/application/use-cases/payment.use-case.ts`):
  - Method `requestActivation(userId)` - tạo yêu cầu kích hoạt với mã unique
  - Method `verifyActivation(userId, paymentCode)` - verify giao dịch kích hoạt
  - Method `requestSessionPayment(sessionId)` - tạo yêu cầu thanh toán buổi học
  - Method `verifySessionPayment(sessionId, paymentCode)` - verify thanh toán
  - Tích hợp với ThienNguyenAPI để tìm giao dịch
  - Tự động cập nhật user status khi activation thành công
  - Tự động cập nhật session status và mentor/mentee stats khi thanh toán thành công

- Cập nhật index files:
  - `/src/infrastructure/external/index.ts` - export external services
  - `/src/infrastructure/index.ts` - thêm export external
  - `/src/application/utils/index.ts` - export utils
  - `/src/application/index.ts` - thêm export utils
  - `/src/application/dto/index.ts` - thêm export charity.dto
  - `/src/application/use-cases/index.ts` - thêm export PaymentUseCase

Stage Summary:
- Charity Service hoàn chỉnh với ThienNguyenAPI integration
- VietQR Service để tạo QR code và deep link
- Payment Code Generator với mã chỉ dùng chữ cái
- Payment Use Case xử lý activation và session payment
- Full type safety với TypeScript
- Error handling đầy đủ với try-catch
- Logging cho các operations quan trọng

---
Task ID: 3
Agent: Activation Feature Agent
Task: Xây dựng API và UI cho tính năng kích hoạt tài khoản Mentee

Work Log:
- Tạo Constants file (`/src/lib/constants.ts`):
  - CHARITY_ACCOUNT_NO = "2000"
  - CHARITY_ACCOUNT_NAME = "HOANG HOA TRUNG"
  - CHARITY_BANK = "MBBank"
  - BANK_BIN_CODE = "970223"
  - ACTIVATION_AMOUNT = 10000
  - Helper functions: formatCurrency(), formatDate(), generateActivationContent()

- Tạo Activation API Route (`/src/app/api/activation/route.ts`):
  - GET: Lấy thông tin kích hoạt của user hiện tại
    - Kiểm tra authentication
    - Nếu user đã kích hoạt, trả về thông tin
    - Nếu chưa, tạo activation code và payment code mới
    - Tạo QR code URL với VietQR
    - Tạo pending transaction trong database
  - POST: Verify kích hoạt
    - Body: { action: "verify" }
    - Gọi PaymentUseCase.verifyActivation()
    - Trả về kết quả verify

- Tạo Activation Page Server Component (`/src/app/activation/page.tsx`):
  - Check authentication với getCurrentUser()
  - Nếu chưa login, redirect về /login
  - Nếu đã kích hoạt, redirect về /dashboard
  - Lấy activation data và truyền cho client component

- Tạo Activation Client Component (`/src/app/activation/activation-client.tsx`):
  - Hiển thị QR Code từ VietQR URL
  - Hiển thị thông tin tài khoản: số tài khoản, tên, ngân hàng
  - Hiển thị số tiền: 10,000 VND
  - Hiển thị nội dung chuyển khoản: "HOCTUTHIEN KICHHOAT {activationCode}"
  - Nút copy cho từng thông tin (sử dụng navigator.clipboard)
  - Nút "Mở ứng dụng ngân hàng" để mở deep link
  - Nút "Tôi đã chuyển khoản" để verify
  - Loading state khi đang verify
  - Success/error messages với Alert components
  - Responsive design với Tailwind CSS

Stage Summary:
- API Route hoàn chỉnh với GET và POST endpoints
- Server-side authentication check
- Dynamic QR code generation với VietQR
- Client-side copy to clipboard functionality
- Loading states và error handling
- Responsive UI với shadcn/ui components
- Tích hợp với PaymentUseCase đã có sẵn

---
Task ID: 4
Agent: Teaching Fields & Mentor Profile Agent
Task: Xây dựng Teaching Fields và Mentor Profile cho dự án Học Từ Thiện

Work Log:
- Tạo Database Seed Script (`/prisma/seed.ts`):
  - Tạo 8 Teaching Fields mặc định:
    - Programming & Software Development
    - Data Science & Machine Learning
    - Business & Entrepreneurship
    - Language Learning
    - Design & Creative
    - Personal Development
    - Career Coaching
    - Finance & Investment
  - Mỗi field có: name, slug, description, icon (lucide), color, sortOrder
  - Thêm script `db:seed` vào package.json

- Tạo Teaching Fields API Route (`/src/app/api/teaching-fields/route.ts`):
  - GET: Lấy danh sách teaching fields đang active
  - Trả về: id, name, slug, description, icon, color

- Tạo Mentor Profile API Route (`/src/app/api/mentor/profile/route.ts`):
  - GET: Lấy profile của mentor hiện tại
    - Bao gồm user info, mentor profile, teaching fields
  - POST: Tạo/cập nhật mentor profile
    - Body: title, company, experienceYears, hourlyRate, bio, teachingFieldIds, charityAccountNo, availableHours
    - Tự động cập nhật role thành MENTOR nếu chưa phải

- Tạo Mentors Public API Routes:
  - `/src/app/api/mentors/route.ts` - GET: Danh sách mentors với filter
    - Query params: teachingField, search, page, limit
    - Trả về danh sách với rating, totalSessions, teachingFields
  - `/src/app/api/mentors/[id]/route.ts` - GET: Chi tiết mentor
    - Bao gồm profile, available slots, reviews

- Tạo Mentor Profile Page (`/src/app/mentor/profile/`):
  - Server Component: Check auth, fetch mentor data
  - Client Component `mentor-profile-form.tsx`:
    - Form với react-hook-form và zod validation
    - Multi-select cho Teaching Fields
    - Input cho số tài khoản Thiện Nguyện App (4 số)
    - Time picker cho lịch trống (available hours) theo ngày trong tuần
    - Stats cards: rating, total sessions, experience years
    - Responsive design

- Tạo Become a Mentor Page (`/src/app/become-mentor/`):
  - Server Component: Check auth, redirect nếu đã là mentor
  - Client Component `become-mentor-content.tsx`:
    - Hero section với CTA
    - Benefits section với 6 lợi ích
    - How it works section với 4 bước
    - FAQ section với 4 câu hỏi thường gặp
    - CTA section cuối trang
    - Tự động chuyển role khi đăng ký

- Tạo Mentor List Page (`/src/app/mentors/`):
  - Server Component: Fetch mentors với filters
  - Client Component `mentors-list.tsx`:
    - Grid cards các mentor
    - Filter theo teaching field (dropdown)
    - Search by name/bio
    - Pagination component
    - Mentor card với avatar, stats, teaching fields, rate

- Tạo Mentor Detail Page (`/src/app/mentors/[id]/`):
  - Server Component: Fetch mentor detail với reviews
  - Client Component `mentor-detail-content.tsx`:
    - Profile header với avatar, title, company, stats
    - Tabs: About, Schedule, Reviews
    - Booking dialog với day/time selection
    - Sidebar với rate và booking button
    - Charity account display

---
Task ID: 5
Agent: Main Agent
Task: Hoàn thiện API và UI cho Mentor, Sessions

Work Log:
- Tạo Session Use Cases (`/src/application/use-cases/session.use-case.ts`):
  - createSession() - Tạo buổi học mới với payment code
  - getSession() - Lấy thông tin buổi học
  - listSessions() - Liệt kê buổi học với filter
  - updateSessionStatus() - Cập nhật trạng thái
  - cancelSession() - Hủy buổi học
  - completeSession() - Hoàn thành và đánh giá
  - generatePaymentCode() - Tạo mã thanh toán (chỉ chữ cái)

- Tạo Mentor Use Cases (`/src/application/use-cases/mentor.use-case.ts`):
  - getMentorProfile() - Lấy profile mentor
  - upsertMentorProfile() - Tạo/cập nhật profile
  - listMentors() - Liệt kê mentors với filter
  - getMentorAvailableSlots() - Lấy lịch trống
  - updateMentorStats() - Cập nhật thống kê

- Cập nhật Prisma Schema:
  - Thêm TeachingField model
  - Thêm MentorTeachingField (many-to-many)
  - Thêm Leaderboard model
  - Cập nhật User với activation fields
  - Cập nhật SessionMentoring với payment fields
  - Thêm PaymentTransaction model chi tiết

- Database Seeding:
  - 8 Teaching Fields mặc định
  - Script db:seed trong package.json

- API Routes:
  - /api/mentors/route.ts - GET/POST mentors
  - /api/mentors/[id]/route.ts - GET mentor detail
  - /api/teaching-fields/route.ts - GET teaching fields
  - /api/sessions/route.ts - GET/POST sessions
  - /api/sessions/[id]/route.ts - GET/PUT session

- UI Components:
  - Mentors List Page với filter và search
  - Mentor Card component với rating, stats
  - Responsive grid layout

Stage Summary:
- Session và Mentor Use Cases hoàn chỉnh
- Prisma Schema mở rộng với đầy đủ entities
- Database seed cho teaching fields
- API Routes cho mentors và sessions
- Mentors List UI với filter, search, pagination

Stage Summary:
- Database seeding cho Teaching Fields hoàn chỉnh
- 5 API routes cho teaching fields, mentor profile, mentors public
- 4 pages (mentor profile, become mentor, mentor list, mentor detail)
- Full responsive design với shadcn/ui components
- Form validation với zod và react-hook-form
- Multi-select teaching fields với visual icons
- Time picker cho available hours theo ngày
- Search và filter functionality
- Pagination cho mentor list
- Booking dialog với day/time selection

---
Task ID: 6
Agent: Main Agent
Task: Sửa lỗi deployment và viết Unit Tests, Integration Tests

Work Log:
- Sửa lỗi searchParams Promise (Next.js 15 breaking change):
  - Sửa `/src/app/login/page.tsx` - searchParams phải được await
  - Sửa `/src/app/mentors/page.tsx` - tương tự

- Cài đặt testing framework:
  - Vitest với React Testing Library
  - happy-dom cho test environment
  - Cấu hình vitest.config.ts

- Viết Unit Tests cho Domain Layer:
  - `email.vo.test.ts` - 9 tests cho Email value object
  - `role.vo.test.ts` - 25 tests cho UserRole value object
  - `base.entity.test.ts` - 26 tests cho BaseEntity
  - `user.entity.test.ts` - 39 tests cho UserEntity

- Viết Unit Tests cho Application Layer:
  - `payment-code.test.ts` - 42 tests cho payment code utilities
  - Test random letter generation
  - Test code validation
  - Test expiry calculation

- Viết Unit Tests cho Infrastructure Layer:
  - `viet-qr.test.ts` - 29 tests cho VietQR service
  - Test bank code normalization
  - Test QR URL generation
  - Test deep link generation
  - Test validation functions

- Viết Integration Tests cho API:
  - `activation.test.ts` - 8 tests cho API response structures
  - Test authentication check logic
  - Test activation status check

- Sửa lỗi build:
  - Export ACTIVATION_CODE_LENGTH từ payment-code.ts

Stage Summary:
- Tổng cộng 178 tests, tất cả passed
- Build thành công
- Testing framework hoàn chỉnh với Vitest
- Test coverage cho Domain, Application, Infrastructure layers
