# Panduan Deployment ke Server

## Prasyarat
- Docker dan Docker Compose terinstall di server
- Database MySQL sudah tersedia (terpisah dari Docker)
- `git` terinstall untuk clone repo

---

## Langkah Deployment

### 1. Clone Repository
```bash
git clone <repo-url> setya-abadi-elektronik
cd setya-abadi-elektronik
```

### 2. Buat File Environment

```bash
cd docker

# API
cp api.env.example api.env
nano api.env
```

Isi nilai berikut di `api.env`:
```
APP_URL=http://IP_SERVER_ANDA:8000
DB_HOST=IP_DATABASE_SERVER
DB_USERNAME=user_db
DB_PASSWORD=password_db
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
```

```bash
# Notification service
cp notification.env.example notification.env
nano notification.env
# Isi SMTP, APP_URL=http://IP_SERVER:3000

# Web frontend (build args)
cp web.env.example web.env
nano web.env
# Isi VITE_API_URL=http://IP_SERVER:8000/api
```

### 3. Build dan Jalankan

```bash
# Di dalam folder docker/
docker compose build --no-cache
docker compose up -d

# Cek status
docker compose ps
```

### 4. Inisialisasi Laravel (first deploy only)

```bash
# Generate app key jika belum ada
docker compose exec app php artisan key:generate

# Jalankan migrasi
docker compose exec app php artisan migrate --force

# Buat symlink storage
docker compose exec app php artisan storage:link

# Seed data awal (jika ada)
docker compose exec app php artisan db:seed --force
```

### 5. Verifikasi

| Service | URL |
|---------|-----|
| Web | `http://IP_SERVER:3000` |
| API | `http://IP_SERVER:8000/api/health` |
| Notification | `http://IP_SERVER:3001` |

---

## Update Deployment (Selanjutnya)

```bash
git pull
cd docker
docker compose build
docker compose up -d
docker compose exec app php artisan migrate --force
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
```

---

## Notes

- **auth_info_baileys** (WhatsApp auth) disimpan di Docker volume `baileys_auth` — persistent antar restart
- **Storage Laravel** disimpan di volume `api_storage`
- Untuk **HTTPS**: pasang reverse proxy (nginx/caddy) di depan port 3000 dan 8000
