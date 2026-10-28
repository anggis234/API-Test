# Swagger Petstore API Automation Testing - Playwright TypeScript

Proyek pengujian otomatisasi API berbasis **Playwright** dan **TypeScript** untuk **Swagger Petstore API** (`https://petstore.swagger.io/v2`). Repositori ini mengimplementasikan standar arsitektur teruji yang diadaptasi dari repositori pengujian UI (`testIndico`), mencakup API Client helper, custom fixture injection, step-by-step reporting, test plans lengkap, dan dokumentasi bug report.

---

## 📁 Struktur Proyek

```text
apiTest/
├── src/
│   ├── fixtures/
│   │   └── base.fixture.ts     # Playwright fixture extension & PetApi injection
│   ├── helpers/
│   │   └── pet.api.ts          # API Client class wrapping Swagger Petstore endpoints
│   ├── test-data/
│   │   └── pet.data.ts         # Factory payload generator & static constants
│   └── utils/
│       └── step-reporter.ts    # Custom console reporter untuk test step
├── tests/
│   └── api/
│       └── pet.spec.ts         # Test specification suite (*.spec.ts)
├── .env.example                # Template konfigurasi environment variables
├── .env                        # Konfigurasi lokal (BASE_URL & API_KEY)
├── package.json                # Dependensi proyek & shortcut scripts
├── playwright.config.ts        # Konfigurasi utama Playwright API testing
```

## 💻 Prasyarat Sistem

- **Node.js**: Versi `20.x` atau lebih baru (disarankan LTS `v22.x`)
- **npm**: Versi `10.x` atau lebih baru
- **Git**

Periksa versi terpasang:
```bash
node -v
npm -v
```

---

## 🚀 Panduan Instalasi & Setup

### 1. Masuk ke Direktori Proyek
```bash
cd apiTest
```

### 2. Pasang Dependensi Node.js
```bash
npm install
```

### 3. Konfigurasi Environment Variable (`.env`)
Salin file konfigurasi contoh `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi `.env`:
```properties
BASE_URL=https://petstore.swagger.io/v2
API_KEY=special-key
```

---

## 🧪 Cara Menjalankan Test

### 1. Menjalankan Seluruh API Test Suite
```bash
npm test
```
atau menggunakan CLI Playwright:
```bash
npx playwright test
```

---

## 📊 Membuka dan Melihat Test Report

Setelah pengujian selesai, Playwright secara otomatis menghasilkan HTML Report interaktif di folder `playwright-report/`.

Jalankan perintah:
```bash
npx playwright show-report
```

### Fitur Laporan:
1. **Granular Steps (`test.step`)**: Pembagian langkah request dan assertion per test case secara runtut.
2. **Timing & Metrics**: Durasi eksekusi per HTTP request dan verifikasi.
3. **Trace Viewer & Request Payloads**: Inspeksi detail header, payload JSON, dan response body secara visual.

---
