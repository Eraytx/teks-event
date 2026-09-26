/**
 * ==============================================================================
 * TEKS EVENT - Yaza Veda Yeni Döneme Merhaba
 * Google Apps Script Web App - Google E-Tablolar (Excel) Senkronizasyon Kodu
 * ==============================================================================
 * Bu kod, web sitesinden gelen kayıt formu verilerini Google E-Tablo'ya
 * otomatik olarak satır satır kaydeder.
 */

// E-Tablo ID'si (Doğrudan tablonuza bağlanır)
const SPREADSHEET_ID = "1XQig3xaMbv2Gussphg3rHo3Osi1OnZVBw1n6qFlZeYk";
// Sayfa Adı
const SHEET_NAME = "Katılımcı Kayıtları";

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.length > 5) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * HTTP POST İsteklerini Karşılar (Form Gönderimleri)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Sayfa yoksa otomatik oluştur
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME, 0); // En başa (1. sıraya) ekle
    }

    // Eğer boş varsayılan Sayfa1 varsa ve birden fazla sayfa varsa, kullanıcı karışıklığını önlemek için temizle
    const defaultSheet = ss.getSheetByName("Sayfa1") || ss.getSheetByName("Sheet1");
    if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
      try { ss.deleteSheet(defaultSheet); } catch (delErr) {}
    }

    // Başlık satırı yoksa oluştur ve renklendir
    setupHeadersIfMissing(sheet);

    // Gelen veriyi ayrıştır (JSON veya Form Data)
    let data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    // Kayıt Numarası oluştur (Örn: #TEKS-8492)
    const kayitNo = data.kayitNo || ("TEKS-" + Math.floor(1000 + Math.random() * 9000));
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, "GMT+3", "dd.MM.yyyy HH:mm:ss");

    // Telefonu WhatsApp linki formatına getir
    const rawPhone = String(data.telefon || "").replace(/\D/g, "");
    const cleanPhone = rawPhone.startsWith("0") ? rawPhone.substring(1) : (rawPhone.startsWith("90") ? rawPhone.substring(2) : rawPhone);
    const waLink = cleanPhone ? ("https://wa.me/90" + cleanPhone) : "-";

    // Yeni satır verisi (11 sütun)
    const newRow = [
      kayitNo,
      formattedDate,
      data.ad || "",
      data.soyad || "",
      data.cinsiyet || "",
      "'" + (data.telefon || ""), // Excel/Sheets'in başındaki sıfırı silmemesi için tek tırnakla
      data.universite || "",
      data.bolum || "",
      data.ucret || "550 TL",
      "Beklemede (WhatsApp İletişimi)",
      waLink
    ];

    // Satırı tabloya ekle
    sheet.appendRow(newRow);

    // Yeni satırın biçimlendirmesi
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, newRow.length).setVerticalAlignment("middle");
    sheet.getRange(lastRow, 1).setFontWeight("bold"); // Kayıt No kalın
    sheet.getRange(lastRow, 10).setBackground("#FEF3C7"); // Durum sütununa hafif sarı vurgu

    // Başarılı yanıt döndür
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Kayıt başarıyla Google E-Tabloya eklendi!",
      kayitNo: kayitNo
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * HTTP GET İsteklerini Karşılar (Tarayıcıdan test etmek için)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "TEKS Event Registration API",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Tablonun başlıklarını ve stillerini otomatik ayarlar
 */
function setupHeadersIfMissing(sheet) {
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Kayıt No",
      "Kayıt Tarihi",
      "Ad",
      "Soyad",
      "Cinsiyet",
      "Telefon",
      "Üniversite",
      "Bölüm",
      "Katılım Ücreti",
      "Ödeme / Onay Durumu",
      "WhatsApp İletişim Linki"
    ];

    sheet.appendRow(headers);

    // Başlık stili (Lüks Koyu Lacivert ve Beyaz Kalın Metin)
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0F172A");
    headerRange.setFontColor("#F8FAFC");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 38);
    sheet.setFrozenRows(1);

    // Sütun genişlikleri
    sheet.setColumnWidth(1, 120); // Kayıt No
    sheet.setColumnWidth(2, 150); // Tarih
    sheet.setColumnWidth(3, 140); // Ad
    sheet.setColumnWidth(4, 140); // Soyad
    sheet.setColumnWidth(5, 100); // Cinsiyet
    sheet.setColumnWidth(6, 140); // Telefon
    sheet.setColumnWidth(7, 200); // Üniversite
    sheet.setColumnWidth(8, 200); // Bölüm
    sheet.setColumnWidth(9, 120); // Ücret
    sheet.setColumnWidth(10, 180); // Durum
    sheet.setColumnWidth(11, 240); // WhatsApp
  }
}
