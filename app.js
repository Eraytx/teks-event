/**
 * ==============================================================================
 * TEKS EVENT - Yaza Veda Yeni Döneme Merhaba
 * Etkinlik Kayıt Sistemi & Google Apps Script Entegrasyonu
 * ==============================================================================
 */

// ==============================================================================
// 1. GOOGLE APPS SCRIPT WEB APP BAĞLANTISI
// Google E-Tablo'ya kayıtların anında otomatik akması için Apps Script Web App
// URL'nizi buraya tırnakların içine yapıştırın:
// ==============================================================================
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwEqI0617KSHVKeJiXUal54hc-3yRL0Sre_dWhQoL8_p4NAxug75sETWw8wwi_hAKBn/exec";

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initPhoneMask();
  initUniversityChips();
  initRegistrationForm();
  initSmoothScroll();
});

/* --------------------------------------------------------------------------
   GERİ SAYIM SAYACI (8 Ekim Perşembe 17:00)
   -------------------------------------------------------------------------- */
function initCountdown() {
  const targetYear = new Date().getFullYear();
  // 8 Ekim saat 17:00
  let eventDate = new Date(`${targetYear}-10-08T17:00:00`);
  
  // Eğer bu yılın tarihi geçmişse bir sonraki yıla hedefle
  if (eventDate.getTime() - new Date().getTime() < 0) {
    eventDate = new Date(`${targetYear + 1}-10-08T17:00:00`);
  }

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function update() {
    const now = new Date().getTime();
    const diff = eventDate.getTime() - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(d).padStart(2, '0');
    hoursEl.textContent = String(h).padStart(2, '0');
    minutesEl.textContent = String(m).padStart(2, '0');
    secondsEl.textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* --------------------------------------------------------------------------
   TELEFON NUMARASI MASKESİ (05XX XXX XX XX)
   -------------------------------------------------------------------------- */
function initPhoneMask() {
  const phoneInput = document.getElementById('telefon');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Sadece rakamlar
    
    // Otomatik 0 ekleme desteği
    if (val.length > 0 && !val.startsWith('0')) {
      val = '0' + val;
    }
    
    // Maksimum 11 hane (05XXXXXXXXX)
    val = val.substring(0, 11);

    // Biçimlendirme: 05XX XXX XX XX
    let formatted = '';
    if (val.length > 0) {
      formatted = val.substring(0, 4);
    }
    if (val.length >= 5) {
      formatted += ' ' + val.substring(4, 7);
    }
    if (val.length >= 8) {
      formatted += ' ' + val.substring(7, 9);
    }
    if (val.length >= 10) {
      formatted += ' ' + val.substring(9, 11);
    }

    e.target.value = formatted;
  });
}

/* --------------------------------------------------------------------------
   ÜNİVERSİTE HIZLI SEÇİM CHİPLERİ
   -------------------------------------------------------------------------- */
function initUniversityChips() {
  const chips = document.querySelectorAll('.uni-chip');
  const uniInput = document.getElementById('universite');

  if (!uniInput || !chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const uniName = chip.getAttribute('data-uni');
      uniInput.value = uniName;
      
      // Aktif chip vurgusu
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      // Varsa hata durumunu temizle
      const group = document.getElementById('group-universite');
      if (group) group.classList.remove('has-error');

      // Kullanıcının dikkatini bölüm alanına yönelt
      const bolumInput = document.getElementById('bolum');
      if (bolumInput && !bolumInput.value) {
        bolumInput.focus();
      }
    });
  });

  // Kullanıcı manuel yazarsa aktif chip stilini kaldır
  uniInput.addEventListener('input', () => {
    chips.forEach(c => {
      if (c.getAttribute('data-uni').toLowerCase() === uniInput.value.trim().toLowerCase()) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   FORM DOĞRULAMA & GOOGLE APPS SCRIPT'E GÖNDERİM
   -------------------------------------------------------------------------- */
function initRegistrationForm() {
  const form = document.getElementById('partyForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnLoader = submitBtn?.querySelector('.btn-loader');
  const successView = document.getElementById('successView');
  const newRegBtn = document.getElementById('newRegistrationBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Alanları Oku ve Doğrula
    const adInput = document.getElementById('ad');
    const soyadInput = document.getElementById('soyad');
    const genderChecked = document.querySelector('input[name="cinsiyet"]:checked');
    const telefonInput = document.getElementById('telefon');
    const uniInput = document.getElementById('universite');
    const bolumInput = document.getElementById('bolum');
    const kvkkCheck = document.getElementById('kvkkCheck');

    let hasError = false;

    function validateField(input, groupId, condition) {
      const group = document.getElementById(groupId);
      if (!condition) {
        group?.classList.add('has-error');
        hasError = true;
      } else {
        group?.classList.remove('has-error');
      }
    }

    validateField(adInput, 'group-ad', adInput.value.trim().length >= 2);
    validateField(soyadInput, 'group-soyad', soyadInput.value.trim().length >= 2);
    validateField(genderChecked, 'group-cinsiyet', !!genderChecked);
    
    // Telefon 11 karakter (05XX XXX XX XX = boşluklarla 14 karakter)
    const rawPhone = telefonInput.value.replace(/\D/g, '');
    validateField(telefonInput, 'group-telefon', rawPhone.length === 11 && rawPhone.startsWith('05'));
    
    validateField(uniInput, 'group-universite', uniInput.value.trim().length >= 2);
    validateField(bolumInput, 'group-bolum', bolumInput.value.trim().length >= 2);
    validateField(kvkkCheck, 'group-kvkk', kvkkCheck.checked);

    if (hasError) {
      // İlk hatalı alana odaklan
      const firstError = document.querySelector('.form-group.has-error input, .checkbox-group.has-error input');
      if (firstError) firstError.focus();
      return;
    }

    // 2. Gönderim Durumunu Başlat (Loading)
    submitBtn.disabled = true;
    btnText?.classList.add('hidden');
    btnLoader?.classList.remove('hidden');

    // Benzersiz Kayıt Referans Kodu Üret (Örn: #TEKS-7391)
    const refCode = '#TEKS-' + Math.floor(1000 + Math.random() * 9000);
    const kayitTarihi = new Date().toLocaleString('tr-TR');

    const payload = {
      kayitNo: refCode,
      tarih: kayitTarihi,
      ad: adInput.value.trim(),
      soyad: soyadInput.value.trim(),
      cinsiyet: genderChecked.value,
      telefon: telefonInput.value.trim(),
      universite: uniInput.value.trim(),
      bolum: bolumInput.value.trim(),
      etkinlik: "TEKS EVENT - Yaza Veda Yeni Döneme Merhaba",
      mekan: "JW Marriott Açık Hava Teras (Kizilirmak Mah, Söğütözü, Muhsin Yazıcıoğlu Cd. No: 1, 06520 Ankara)",
      ucret: "550 TL (İçecek Dahil Değil)"
    };

    // 3. Google Apps Script Web App Üzerinden Google E-Tabloya Gönder
    if (GOOGLE_APPS_SCRIPT_URL && GOOGLE_APPS_SCRIPT_URL.trim().startsWith('http')) {
      try {
        await fetch(GOOGLE_APPS_SCRIPT_URL.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        console.log('Kayıt Google E-Tabloya başarıyla iletildi.');
      } catch (scriptErr) {
        console.warn('Apps Script isteği sırasında bağlantı uyarısı:', scriptErr);
      }
    } else {
      console.log('Bilgi: Google Apps Script URL henüz tanımlanmamış. Kayıt görsel olarak tamamlandı.', payload);
    }

    // 4. Dijital Bilet / Kart Bilgilerini Güncelle
    const ticketRefCode = document.getElementById('ticketRefCode');
    const ticketUserName = document.getElementById('ticketUserName');
    const ticketUserUni = document.getElementById('ticketUserUni');

    if (ticketRefCode) ticketRefCode.textContent = refCode;
    if (ticketUserName) ticketUserName.textContent = `${payload.ad} ${payload.soyad}`;
    if (ticketUserUni) ticketUserUni.textContent = `${payload.universite} - ${payload.bolum}`;

    // 5. Ses Efekti Çal (Web Audio API)
    playCelebrationChime();

    // 6. Başarı Ekranına Geç
    form.classList.add('hidden');
    successView.classList.remove('hidden');

    // Başarı ekranına pürüzsüz kaydır
    successView.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Butonu sıfırla
    submitBtn.disabled = false;
    btnText?.classList.remove('hidden');
    btnLoader?.classList.add('hidden');
  });

  // "Başka Bir Arkadaşını Kaydet" Butonu
  if (newRegBtn) {
    newRegBtn.addEventListener('click', () => {
      form.reset();
      document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
      document.querySelectorAll('.uni-chip').forEach(c => c.classList.remove('active'));
      
      successView.classList.add('hidden');
      form.classList.remove('hidden');
      
      const firstInput = document.getElementById('ad');
      if (firstInput) firstInput.focus();
    });
  }
}

/* --------------------------------------------------------------------------
   BAŞARI SES EFEKTİ (Web Audio API - Harici dosya gerektirmez)
   -------------------------------------------------------------------------- */
function playCelebrationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Kutlama akoru)
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  } catch (err) {
    // Ses desteği yoksa sessizce devam et
  }
}

/* --------------------------------------------------------------------------
   PÜRÜZSÜZ SAYFA İÇİ GEÇİŞLER (Smooth Scroll)
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
