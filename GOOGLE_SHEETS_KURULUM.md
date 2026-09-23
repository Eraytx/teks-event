# 📊 Google E-Tablo (Excel) & Apps Script Bağlantı Kılavuzu

Bu kılavuz sayesinde web sitenizden yapılan tüm kayıtlar, anında kendi **Google E-Tablonuza (Sheets)** otomatik olarak satır satır ve sütun sütun eklenecektir.

---

### Adım 1: Yeni Bir Google E-Tablo Oluşturun
1. Tarayıcınızda [Google E-Tablolar (sheets.new)](https://sheets.new) adresine gidin.
2. Tablonun sol üst köşesine bir isim verin (Örn: `TEKS Event - Parti Kayıtları`).
3. *(İsteğe bağlı)* Sayfa adını `Katılımcı Kayıtları` yapabilirsiniz (kod otomatik de algılar).

---

### Adım 2: Apps Script Kodunu Yapıştırın
1. Google E-Tablo üst menüsünden: **Uzantılar (Extensions) > Apps Script** seçeneğine tıklayın.
2. Açılan editördeki varsayılan kodları silin (`function myFunction() { ... }`).
3. Projenizdeki [`google-apps-script/Code.gs`](file:///C:/Users/ilier/.gemini/antigravity-ide/scratch/teks-event-party/google-apps-script/Code.gs) dosyasının tüm içeriğini kopyalayıp buraya yapıştırın.
4. Üst kısımdaki 💾 **Kaydet (Disk)** simgesine basın.

---

### Adım 3: Web Uygulaması Olarak Dağıtın (Deploy)
1. Sağ üst köşedeki mavi **Dağıt (Deploy)** butonuna tıklayın ve **Yeni dağıtım (New deployment)** seçin.
2. Sol taraftaki dişli çark ⚙️ simgesinden tür olarak **Web uygulaması (Web app)** seçin.
3. Ayarları şu şekilde yapın:
   - **Açıklama (Description)**: `TEKS Event Kayıt API`
   - **Farklı yürüt (Execute as)**: `Ben (your-email@gmail.com)`
   - **Erişimi olanlar (Who has access)**: **`Herkes (Anyone)`** *(Önemli: Formu dolduran katılımcıların verilerinin tabloya yazılabilmesi için "Herkes" seçilmelidir).*
4. **Dağıt (Deploy)** butonuna tıklayın.
5. İzin isteği gelirse **Erişime İzin Ver (Authorize access)** > Kendi Gmail hesabınızı seçin > **Gelişmiş (Advanced)** > **(Güvenli değil bağlantısına git)** > **İzin Ver (Allow)** deyin.
6. Dağıtım tamamlanınca size verilen **Web Uygulaması URL'sini (Web app URL)** kopyalayın (`https://script.google.com/macros/s/.../exec`).

---

### Adım 4: Web Sitesine URL'yi Ekleyin
1. Projedeki [`app.js`](file:///C:/Users/ilier/.gemini/antigravity-ide/scratch/teks-event-party/app.js) dosyasını açın.
2. En üstteki satırı kopyaladığınız URL ile güncelleyin:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = "BURAYA_KOPYALADIGINIZ_URL_GELECEK";
   ```
3. Ayrıca hemen altındaki organizatör WhatsApp numaranızı da güncelleyebilirsiniz:
   ```javascript
   const ORGANIZER_WHATSAPP_NUMBER = "905XXXXXXXXX";
   ```
4. Dosyayı kaydedin. Artık web sitenizden gelen her kayıt anında Google E-Tablonuza düşecektir!

---

### ✨ Tabloda Neler Otomatik Yapılır?
- **Otomatik Tablo Başlıkları**: Tablo boşsa başlıkları ve sütun genişliklerini koyu lacivert & sarı şık tasarımla otomatik oluşturur.
- **WhatsApp Doğrudan Link**: Her katılımcının telefon numarasından tek tıkla doğrudan WhatsApp sohbeti başlatma linki oluşturulur.
- **Excel Olarak İndirme**: Google E-Tablonuzdan dilediğiniz an `Dosya > İndir > Microsoft Excel (.xlsx)` diyerek anlık Excel çıktısı alabilirsiniz.
