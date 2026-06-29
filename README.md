# Transparansi Bot Beda Pers

Chatbot dwibahasa Indonesia–Inggris yang membaca data transparansi editorial dari Google Spreadsheet. Aplikasi ini statis, responsif, dan siap dipasang melalui iframe.

Bot berfungsi menjelaskan bagaimana berita dibuat—termasuk peliputan, verifikasi, pemilihan narasumber, independensi, dan penggunaan AI. Jawaban AI disajikan dalam poin singkat agar mudah dipindai. Bot menunjukkan bukti proses, bukan menjamin bahwa berita pasti benar atau jujur.

## Mengaktifkan jawaban AI

Bot memiliki endpoint Vercel `/api/chat` yang membaca seluruh data dan `isi_artikel` dari Sheet. Tanpa API key, bot tetap memakai pencocokan lokal sebagai fallback.

1. Buat API key OpenAI.
2. Di Vercel buka proyek → **Settings → Environment Variables**.
3. Tambahkan nama `OPENAI_API_KEY`, tempel key sebagai nilainya, dan aktifkan untuk Production, Preview, serta Development.
4. Opsional: tambahkan `OPENAI_MODEL` untuk mengganti model bawaan `gpt-5.4-mini`.
5. Buka tab **Deployments**, pilih deployment terbaru, lalu lakukan **Redeploy**.

Jangan pernah menyimpan API key di GitHub, Google Sheet, `config.js`, atau kode sisi browser.

## Format Google Sheet

Ubah Sheet menjadi tiga kolom berikut:

| kunci | indonesia | english |
|---|---|---|
| judul | Judul dalam bahasa Indonesia | English title |
| nama_reporter | Nama penulis | Writer name |
| profil_penulis | Profil penulis dalam bahasa Indonesia | Writer profile in English |
| metode_verifikasi | Penjelasan verifikasi | Verification explanation |

Baris pertama wajib berisi `kunci`, `indonesia`, dan `english`. Nama pada kolom `kunci` tidak diterjemahkan.

### Contoh tulisan penulis (opsional)

Tambahkan pasangan baris berikut untuk setiap contoh tulisan:

| kunci | indonesia | english |
|---|---|---|
| contoh_tulisan_1_judul | Judul Indonesia | English title |
| contoh_tulisan_1_link | https://... | https://... |
| contoh_tulisan_2_judul | Judul Indonesia | English title |
| contoh_tulisan_2_link | https://... | https://... |

Bagian ini boleh dilewati. Jika tidak ada baris contoh tulisan, bot hanya menampilkan profil penulis. Nomor dapat dilanjutkan menjadi `3`, `4`, dan seterusnya.

Setelah Sheet diubah, pastikan **File → Bagikan → Publikasikan ke web** masih aktif. URL CSV publik disimpan di `config.js`.

## Deploy

Unggah ulang seluruh file ke repository GitHub yang sama. Vercel akan membuat deployment baru secara otomatis.

## Memasang dengan iframe

Ganti URL berikut dengan URL produksi Vercel:

```html
<iframe
  src="https://nama-proyek.vercel.app"
  title="Transparansi Bot Beda Pers"
  width="100%"
  height="760"
  loading="lazy"
  style="border:0;border-radius:20px;overflow:hidden"
></iframe>
```

Jika area ICM sempit, tinggi `700`–`800` piksel biasanya nyaman. Pada layar kecil, bot otomatis memenuhi area iframe.

Tambahkan `?lang=en` pada URL untuk membuka iframe langsung dalam bahasa Inggris, atau `?lang=id` untuk bahasa Indonesia.

## Alamat setiap artikel

- Artikel pertama: `https://transparansi-bot-beda-pers.vercel.app/`
- Melarang Media Sosial Saja Tak Cukup: `https://transparansi-bot-beda-pers.vercel.app/?article=melarang-medsos-saja-tak-cukup`
- Menangkal, Bukan Membungkam: `https://transparansi-bot-beda-pers.vercel.app/?article=menangkal-bukan-membungkam`

Tambahkan `&lang=en` pada alamat artikel yang sudah memiliki parameter untuk membukanya langsung dalam bahasa Inggris.
