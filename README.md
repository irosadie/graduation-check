# SMPN 1 Rangsang Barat — Pengumuman Kelulusan

Website pengecekan hasil kelulusan siswa berbasis Next.js dengan Supabase (PostgreSQL) via Prisma.

## Tech Stack

- **Framework:** Next.js 16 + TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase PostgreSQL (via Prisma v5)
- **ORM:** Prisma v5 (prisma-client-js)
- **Library:** canvas-confetti, xlsx

## Persiapan Sebelum Deploy ke Vercel

### 1. Environment Variables

Buat file `.env` dari `.env.example`:

```bash
cp .env.example .env
```

Isi variabel berikut di Vercel Dashboard (**Settings → Environment Variables**):

| Variable | Contoh |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10` |
| `DIRECT_URL` | `postgresql://user:pass@host:5432/postgres` |
| `OPEN_AT` | `02/06/2026 19:00:01` (format: `DD/MM/YYYY HH:mm:ss`) |
| `MODE` | `dev` |
| `PASS` | `5ayaganteng` |

> **Catatan:** `DATABASE_URL` pakai port **6543** (pooler Supabase), `DIRECT_URL` pakai port **5432** (koneksi langsung untuk migrasi Prisma).

### 2. Setup Database

Jalankan migrasi & seed data siswa dari `data/lulus.xlsx`:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 3. Deploy ke Vercel

1. Push repo ke GitHub
2. Import project ke Vercel
3. Tambah semua environment variables di atas
4. Set **Build Command**: `npx prisma generate && next build`
5. Deploy!

### 4. Dev Mode (Admin)

Untuk bypass countdown (ngecek data sebelum waktu pengumuman), akses:

```
https://domain.com/?mode=dev&pass=5ayaganteng
```

---

## Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build production |
| `npm run seed` | Seed data siswa dari `data/lulus.xlsx` |
| `npx prisma migrate dev` | Migrasi database (dev) |
| `npx prisma migrate deploy` | Migrasi database (prod) |
| `npx prisma studio` | Prisma Studio |

---

© 2026 SMP Negeri 1 Rangsang Barat. All rights reserved
created by [BinaryDev](https://www.binarydev.co.id) | 085265279959
