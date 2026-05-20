# AquaChain - Frontend Web Dashboard

Repositori ini berisi kode sumber untuk **Frontend Web Dashboard** yang dirancang untuk memberikan visibilitas penuh kepada supervisor/auditor dalam memantau kondisi kolam secara *real-time* dan melakukan audit data operasional. 

> **Catatan:** Versi repositori saat ini berisi antarmuka (UI) dengan data simulasi (*mock data*). Integrasi penuh dengan API Backend sedang dalam tahap pengembangan.

## Fitur Utama

*   **Monitoring Real-Time:** Memantau parameter kualitas air (pH, Suhu, Kekeruhan) secara langsung.
*   **Manajemen Jadwal Pakan:** Antarmuka untuk melihat dan mengatur jadwal pakan otomatis (Auto-Feeder).
*   **Smart Logic Alert:** Visualisasi peringatan dini (*early warning*) saat sensor mendeteksi anomali berbahaya di kolam.
*   **Audit Blockchain:** Halaman khusus untuk memverifikasi keaslian log operasional pakan (*Immutable Ledger*).

## Tech Stack

Aplikasi antarmuka ini dibangun menggunakan teknologi modern untuk menjamin performa dan responsivitas:
*   **Framework:** [Next.js](https://nextjs.org/) (App Router) & React
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **Icons:** Lucide React

## Cara Menjalankan di Lingkungan Lokal

Karena aplikasi belum sampai tahap deployment, ikuti langkah-langkah berikut untuk menjalankan prototipe UI ini secara lokal di komputer Anda:

### Prasyarat
Pastikan Anda sudah menginstal **Node.js** (versi 18.x atau terbaru) dan **npm** di komputer Anda.

### Langkah-langkah Instalasi

1. **Clone repositori ini** ke dalam direktori lokal Anda:
   ```bash
   git clone https://github.com/Reksti-Kelompok-11/Web-App-Aquachain.git
   ```
2. **Masuk ke folder proyek:**
   ```bash
   cd Web-App-Aquachain
   ```
3. **Install semua dependencies:**
   ```bash
   npm install
   ```
4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
5. **Buka Aplikasi:**
   Buka browser Anda dan akses tautan berikut: http://localhost:3001
   
   
