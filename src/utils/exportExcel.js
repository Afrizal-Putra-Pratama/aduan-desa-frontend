import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Fungsi export data aduan ke Excel dengan styling dan footer
export function exportComplaintsToExcel(complaints, fileName = "aduan_desa.xlsx") {
  // Mapping data aduan ke format yang rapi dan terurut
  const rows = complaints.map(c => ({
    "ID": c.id,
    "Judul": c.title,
    "Deskripsi": c.description,
    "Kategori": c.category_name,
    "Prioritas": c.priority,
    "Status": c.status,
    "Nama User": c.user_name,
    "Email User": c.user_email,
    "Lokasi": c.location || "",
    "Tanggal Buat": c.created_at,
    "Tanggal Ubah": c.updated_at
  }));

  // Buat worksheet dari data
  const ws = XLSX.utils.json_to_sheet(rows);

  // Tentukan lebar kolom otomatis berdasarkan header dan data
  const headerKeys = Object.keys(rows[0] || {});
  ws['!cols'] = headerKeys.map(key => ({
    wch: Math.max(key.length + 4, 20)
  }));

  // Buat workbook dan tambahkan worksheet data aduan
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pengaduan");

  // Tambahkan footer manual sebagai baris terpisah (setelah data)
  const footer = [
    ["", "", "", "", ""], // baris kosong
    ["Dibuat oleh: Tim Pengembangan Sistem"],
    ["Tanggal: " + new Date().toLocaleDateString("id-ID")],
    ["Ttd. Kepada Desa Wonokerso"]
  ];
  XLSX.utils.sheet_add_aoa(ws, footer, { origin: -1 });  // Tambah footer di bawah data yang sudah ada

  // Buat file Excel dan simpan
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
}
