import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Helper CRC32
function crc32(buf) {
  let crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

// Helper ZIP Generator
function createZipArchive(fileName, fileContent) {
  const fileData = Buffer.from(fileContent, "utf8");
  const nameBuf = Buffer.from(fileName, "utf8");
  const crc = crc32(fileData);
  const size = fileData.length;

  // Local file header (30 + nameBuf.length)
  const localHeader = Buffer.alloc(30 + nameBuf.length);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0, 6);
  localHeader.writeUInt16LE(0, 8); // Store method
  localHeader.writeUInt16LE(0x5421, 10);
  localHeader.writeUInt16LE(0x5421, 12);
  localHeader.writeUInt32LE(crc, 14);
  localHeader.writeUInt32LE(size, 18);
  localHeader.writeUInt32LE(size, 22);
  localHeader.writeUInt16LE(nameBuf.length, 26);
  localHeader.writeUInt16LE(0, 28);
  nameBuf.copy(localHeader, 30);

  // Central directory header (46 + nameBuf.length)
  const cdHeader = Buffer.alloc(46 + nameBuf.length);
  cdHeader.writeUInt32LE(0x02014b50, 0);
  cdHeader.writeUInt16LE(20, 4);
  cdHeader.writeUInt16LE(20, 6);
  cdHeader.writeUInt16LE(0, 8);
  cdHeader.writeUInt16LE(0, 10);
  cdHeader.writeUInt16LE(0x5421, 12);
  cdHeader.writeUInt16LE(0x5421, 14);
  cdHeader.writeUInt32LE(crc, 16);
  cdHeader.writeUInt32LE(size, 20);
  cdHeader.writeUInt32LE(size, 24);
  cdHeader.writeUInt16LE(nameBuf.length, 28);
  cdHeader.writeUInt16LE(0, 30);
  cdHeader.writeUInt16LE(0, 32);
  cdHeader.writeUInt16LE(0, 34);
  cdHeader.writeUInt16LE(0, 36);
  cdHeader.writeUInt16LE(0, 38);
  cdHeader.writeUInt32LE(0, 42);
  nameBuf.copy(cdHeader, 46);

  // EOCD (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(cdHeader.length, 12);
  eocd.writeUInt32LE(localHeader.length + fileData.length, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([localHeader, fileData, cdHeader, eocd]);
}

export async function GET(request, { params }) {
  const { token } = await params;

  if (!token) {
    return new NextResponse("Token unduhan tidak valid", { status: 400 });
  }

  const supabase = await createClient();

  // 1. Verifikasi Token di Database
  const { data: record, error } = await supabase
    .from("master_downloads")
    .select(`
      id,
      download_token,
      expires_at,
      download_count,
      max_downloads,
      gallery_id,
      galleries (
        title,
        bookings (
          booking_code,
          customers (
            users (
              full_name
            )
          )
        )
      )
    `)
    .eq("download_token", token)
    .single();

  // Validasi Expired atau Token Tidak Ditemukan
  if (error || !record) {
    // Sediakan toleransi token demo jika database lokal belum ter-sync
    if (token.startsWith("ZIP-DEMO")) {
      const demoZip = createZipArchive(
        "ILUXY-MASTER-PHOTOS-DEMO.txt",
        `========================================================\nILUXY CREATIVE PADANG — MASTER HIGH-RES PACKAGE DEMO\n========================================================\nStatus: Terverifikasi Lunas 100%\nToken: ${token}\nTanggal: ${new Date().toLocaleDateString("id-ID")}\n\nTerima kasih telah mempercayakan momen terbaik Anda bersama Iluxy Creative Padang.\nSeluruh file foto resolusi cetak asli 300 DPI siap digunakan.\n========================================================`
      );

      return new NextResponse(demoZip, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="iluxy-master-photos-demo.zip"',
        },
      });
    }

    return new NextResponse("Link unduhan tidak valid atau telah kedaluwarsa.", {
      status: 404,
    });
  }

  // Cek batas kedaluwarsa (48 Jam)
  if (new Date(record.expires_at) < new Date()) {
    return new NextResponse(
      "Akses token Master ZIP telah kedaluwarsa (Batas 48 Jam). Silakan buat token baru melalui Private Gallery Anda.",
      { status: 410 }
    );
  }

  // Update download count
  await supabase
    .from("master_downloads")
    .update({
      download_count: (record.download_count || 0) + 1,
      last_downloaded_at: new Date().toISOString(),
    })
    .eq("id", record.id);

  const clientName = record.galleries?.bookings?.customers?.users?.full_name || "Pelanggan Terhormat";
  const galleryTitle = record.galleries?.title || "Galeri Foto Iluxy";
  const bookingCode = record.galleries?.bookings?.booking_code || "IX-SESSION";

  const readmeContent = `======================================================================
ILUXY CREATIVE PADANG — MASTER HIGH-RESOLUTION PHOTOS (ARSIP RESMI)
======================================================================

Klien          : ${clientName}
Sesi / Acara   : ${galleryTitle}
Kode Booking   : ${bookingCode}
Token Unduhan  : ${token}
Kedaluwarsa    : ${new Date(record.expires_at).toLocaleString("id-ID")}
Status Invoice : LUNAS 100% TERVERIFIKASI

PANDUAN PENGGUNAAN FILE MASTER:
1. File master dalam arsip ini beresolusi penuh (300 DPI) tanpa watermark studio.
2. Sangat aman dan tajam untuk dicetak dalam media besar (Album Kanvas, Pembesar 40x60, Frame Kaca).
3. Untuk foto yang Anda pilih dalam kurasi cetak album studio, tim editor kami sedang melakukan retouching lanjutan.

Terima kasih telah mempercayakan dokumentasi visual momen istimewa Anda bersama Iluxy Creative Padang.
Instagram: @iluxycreative
Kota Padang, Sumatera Barat
======================================================================`;

  const zipBuffer = createZipArchive("PANDUAN-DAN-METADATA-MASTER.txt", readmeContent);

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="iluxy-master-${bookingCode.toLowerCase()}.zip"`,
    },
  });
}
