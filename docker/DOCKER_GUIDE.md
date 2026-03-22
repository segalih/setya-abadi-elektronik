# Setya Abadi Elektronik - Docker Installation Guide

Panduan ini menjelaskan cara menginstal dan menjalankan seluruh ekosistem Setya Abadi Elektronik (API, Web Frontend, & Notification Service) menggunakan Docker.

## 📋 Prasyarat
- **Docker Desktop** (untuk Windows) atau **Docker Engine/Compose** (untuk Linux).
- Memastikan port **3000, 3001, 8000, dan 3306** tersedia.

## 📂 Struktur Folder
Semua konfigurasi Docker dipusatkan di folder `docker/`:
- `docker/api/`: Dockerfile & Nginx untuk Laravel API.
- `docker/web/`: Dockerfile & Nginx untuk React Frontend.
- `docker/notification-service/`: Dockerfile untuk Node.js (WhatsApp).
- `docker/docker-compose.yml`: Orkestrator seluruh layanan.

---

## 🚀 Langkah Instalasi

### 1. Persiapan Environment
Pindah ke folder root proyek dan buat file `.env` untuk Docker:
```bash
# Salin template env ke file .env di dalam folder docker
cp docker/.env.example docker/.env
```
Buka `docker/.env` dan sesuaikan nilainya:
- **EXTERNAL_STORAGE_PATH**: Ubah ke path penyimpanan di luar Docker.
  - Windows: `D:/SetyaStorage`
  - Linux: `/home/setyanet/storage`

### 2. Jalankan Docker Compose
Masuk ke folder `docker/` dan jalankan perintah build & up:
```bash
cd docker
docker compose up -d --build
```

### 3. Inisialisasi Database (Hanya Sekali)
Setelah kontainer berjalan, jalankan migrasi database Laravel:
```bash
docker exec -it setya-api php artisan migrate:fresh --seed
```

---

## 🔗 Akses Layanan
- **Web Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Backend**: [http://localhost:8000](http://localhost:8000)
- **Notification Service**: [http://localhost:3001](http://localhost:3001)

## 💾 Penyimpanan Luar (Persistent Storage)
File upload (API) dan session WhatsApp (Baileys) akan disimpan secara otomatis di path yang Anda tentukan di `EXTERNAL_STORAGE_PATH`.
- Path `/api`: Menyimpan file order/bukti bayar.
- Path `/baileys`: Menyimpan session login WhatsApp.

## 🛠 Troubleshooting
- **Permission Issue (Linux)**: Jika folder storage tidak bisa ditulisi, jalankan `sudo chown -R 777` pada folder di host.
- **Port Conflict**: Jika port sudah terpakai, ubah mapping port di `docker-compose.yml`.

---
*Created by Antigravity*
