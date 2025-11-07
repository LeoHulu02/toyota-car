// Modal produk & interaksi kartu
(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var WA_NUMBER = '6285207614448';

  function ensureButtons() {
    // Pastikan teks tombol harga menjadi "Harga" dan href ke pricelist.html
    $all('a.button.yith-wcqv-button').forEach(function (btn) {
      btn.textContent = 'Harga';
      btn.setAttribute('href', 'pricelist.html');
      // Hindari intersepsi oleh plugin Quick View: hapus kelas & atribut terkait
      btn.classList.remove('yith-wcqv-button');
      btn.removeAttribute('data-product_id');
      // Tandai agar handler lain tahu ini tombol harga asli
      btn.setAttribute('data-role', 'price-button');
    });
  }

  function buildModalOnce() {
    // Gunakan modal yang sudah ada di HTML jika tersedia, jika tidak buat baru
    var overlay = $('#carModal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'carModal';
      overlay.className = 'car-modal-overlay';
      overlay.innerHTML = [
        '<div class="car-modal" role="dialog" aria-modal="true" aria-labelledby="car-modal-title">',
        '  <div class="car-modal-header">',
        '    <h3 id="car-modal-title" class="car-modal-title">Detail Mobil</h3>',
        '    <button class="car-modal-close" aria-label="Tutup">&times;</button>',
        '  </div>',
        '  <div class="car-modal-body">',
        '    <img class="car-modal-image" alt="Gambar mobil" />',
        '    <div class="car-modal-info">',
        '      <h4 class="car-modal-name"></h4>',
        '      <p class="car-modal-category"></p>',
        '      <div class="car-modal-actions">',
        '        <a class="car-modal-wa btn" target="_blank" rel="noopener">WhatsApp</a>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
      document.body.appendChild(overlay);
    }

    // Pasang handler sekali saja untuk menghindari duplikasi
    if (!overlay.dataset.wired) {
      overlay.addEventListener('click', function (e) {
        // Tutup modal hanya jika klik terjadi di area luar dialog (overlay)
        if (!e.target.closest('.car-modal')) { closeModal(); }
      });
      var closeBtn = $('.car-modal-close', overlay);
      if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
          e.preventDefault();
          closeModal();
        });
      }
      overlay.dataset.wired = 'true';
    }

    // Keydown listener: pasang sekali saja di dokumen
    if (!document.body.dataset.modalKeydownWired) {
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
      });
      document.body.dataset.modalKeydownWired = 'true';
    }
    // Hapus fallback global agar tidak mengintersep listener close di tombol
  }

  function openModal(details) {
    var overlay = $('#carModal');
    if (!overlay) return;
    var imgEl = $('.car-modal-image', overlay);
    var nameEl = $('.car-modal-name', overlay);
    var catEl = $('.car-modal-category', overlay);
    var waEl = $('.car-modal-wa', overlay);

    if (imgEl) {
      imgEl.src = details.image || '';
      imgEl.alt = details.name ? ('Gambar ' + details.name) : 'Gambar mobil';
    }
    if (nameEl) nameEl.textContent = details.name || 'Mobil Toyota';
    if (catEl) catEl.textContent = details.category ? ('Kategori: ' + details.category) : '';
    if (waEl) {
      var text = 'Halo M. Andriansyah, saya tertarik dengan Toyota ' + (details.name || '') + '. Info lebih lanjut ya.';
      var url = 'https://api.whatsapp.com/send?phone=' + WA_NUMBER + '&text=' + encodeURIComponent(text);
      waEl.href = url;
    }

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    var overlay = $('#carModal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function extractDetails(cardBox) {
    var img = $('img', cardBox);
    var nameLink = $('.box-text .product-title a', cardBox);
    var cat = $('.box-text .category', cardBox);
    return {
      image: img ? img.src : '',
      name: nameLink ? (nameLink.textContent || nameLink.getAttribute('aria-label') || '') : '',
      category: cat ? (cat.textContent || '') : ''
    };
  }

  function wireCardClicks() {
    // Klik pada gambar/title di dalam kartu membuka modal, tidak mengganggu tombol harga
    $all('.product-small.box').forEach(function (box) {
      var imgLink = $('.box-image a', box);
      var titleLink = $('.box-text .product-title a', box);

      function attachModalLink(anchor) {
        if (!anchor) return;
        anchor.addEventListener('click', function (e) {
          // Jika anchor adalah tombol harga, biarkan default
          if (anchor.matches('[data-role="price-button"], .yith-wcqv-button')) {
            return; // tombol harga menuju pricelist
          }
          e.preventDefault();
          e.stopPropagation();
          openModal(extractDetails(box));
        });
      }

      attachModalLink(imgLink);
      attachModalLink(titleLink);

      // Klik area box juga buka modal kecuali jika klik berasal dari tombol harga
      box.addEventListener('click', function (e) {
        if (e.target && e.target.closest('[data-role="price-button"], .yith-wcqv-button')) return;
        openModal(extractDetails(box));
      });
    });
  }

  function init() {
    buildModalOnce();
    ensureButtons();
    wireCardClicks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();