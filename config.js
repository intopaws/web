/* ============================================================
   intoPaws Studio — CẤU HÌNH WEBSITE
   Sửa giá / sản phẩm ở đây. Nhớ sửa GIỐNG HỆT trong file
   apps-script/Code.gs (bảng PRICES và COLORS) — server tính lại tiền
   theo bảng đó để khách không sửa giá được.
   ============================================================ */

window.INTOPAWS = {
  // Dán link Web App của Google Apps Script vào đây (xem HUONG-DAN.md, bước 3)
  API_URL: "https://script.google.com/macros/s/AKfycbxbVRxWuR1fuKQapcVyJSo4YwI-6YygyhW0QVMc8ULI4Bn1IM_5oN8o5hTkHTYPK2gHPQ/exec",

  SHIP_FEE: 14000,          // ship toàn quốc
  FREESHIP_FROM: 399000,    // freeship cho đơn từ 399K (tính trên tiền hàng)

  contact: {
    instagram: "https://instagram.com/intopaws.studio",
    facebook: "https://facebook.com/intopaws",
    tiktok: "https://tiktok.com/@intopaws.studio",
    zalo: "https://zalo.me/0943485212",
    zaloNumber: "0943485212",
    noelDesigner: "https://sites.google.com/view/intopaws-noel-2026/pickyourfavorite"
  },

  /* ---------- BÁT ---------- */
  // 8 màu, phần trên và phần đế chọn riêng. slug = tên ảnh trong images/mix/
  bowlColors: [
    { name: "Xanh lá", slug: "xanh-la", hex: "#5fb86a" },
    { name: "Xanh dương", slug: "xanh-duong", hex: "#6f93d6" },
    { name: "Hồng", slug: "hong", hex: "#efb9c2" },
    { name: "Tím", slug: "tim", hex: "#9a7cc6" },
    { name: "Đỏ", slug: "do", hex: "#c9524f" },
    { name: "Trắng", slug: "trang", hex: "#eceef0" },
    { name: "Vàng", slug: "vang", hex: "#e9c240" },
    { name: "Xanh ngọc", slug: "xanh-ngoc", hex: "#7fcfc4" },
    // màu đế riêng của bát Jelly (extra: không hiện ở dáng khác)
    { name: "Kem", slug: "kem", hex: "#efe7d8", extra: true },
    { name: "Nâu socola", slug: "nau", hex: "#5b3b2e", extra: true },
    { name: "Xanh baby", slug: "xanh-baby", hex: "#bcd5ee", extra: true }
  ],
  bowlInner: [
    { id: "sau", label: "Bát sâu", note: "Ø14cm, sâu 4cm, loại tiêu chuẩn" },
    { id: "nong", label: "Dĩa nông", note: "Ø13.5cm, sâu 2cm, bé ăn pate dễ hơn" }
  ],
  CHARM_PRICE: 49000,
  // Thông tin từng dáng bát. mix: cách xem trước phối màu
  //   "split" = ghép nửa trên/nửa dưới từ ảnh từng màu (images/mix/bong/top-*.jpg, base-*.jpg)
  //   "combo" = ảnh chụp sẵn từng cặp màu (images/mix/sao/<trên>--<đế>.jpg)
  //   "solid" = ảnh bát một màu, ghép nửa trên + nửa dưới (images/mix/sao2/<màu>.jpg)
  //   "jelly" = ảnh chụp sẵn từng cặp (images/mix/jelly/<trên>--<đế>.jpg); tops/bases = các màu được chọn
  //   "none"  = chưa có ảnh từng màu
  bowls: [
    { id: "bat-bong", short: "Bông", size: "18×18cm", height: "12cm", fit: "vừa vặn", mix: "split",
      hero: "images/home/bong-hero.jpg", tags: ["bát ăn", "chống kiến", "bông hoa", "nhiều màu", "cho", "công chúa", "méo meo", "gâu gâu"] },
    { id: "bat-sao", short: "Ngôi Sao", size: "20×22cm", height: "11cm", fit: "bé chân ngắn", mix: "solid",
      hero: "images/gallery/sao-1.jpg", tags: ["bát ăn", "chống kiến", "ngôi sao", "dáng thấp", "cho", "bé", "chân ngắn"] },
    { id: "bat-jelly", short: "Jelly", size: "19×19cm", height: "16cm", fit: "bé lớn", mix: "jelly",
      tops: ["Đỏ", "Hồng", "Tím", "Vàng", "Xanh dương", "Xanh lá", "Xanh ngọc"], bases: ["Kem", "Nâu socola", "Hồng", "Xanh baby"],
      hero: "images/gallery/jelly-1.jpg", tags: ["bát ăn", "chống kiến", "dáng thạch", "cao nhất", "cho", "bé", "lớn"] }
  ],

  /* ---------- COOKIE ---------- */
  // 13 mẫu sẵn (ảnh ở images/cookie/<id>.jpg)
  cookieDesigns: [
    { id: "cun-1", kind: "cún", name: "Husky" }, { id: "cun-2", kind: "cún", name: "Long-eared" },
    { id: "cun-3", kind: "cún", name: "Poodle 01" }, { id: "cun-4", kind: "cún", name: "Becgie" },
    { id: "cun-5", kind: "cún", name: "Corgi" }, { id: "cun-6", kind: "cún", name: "Samoyed" },
    { id: "cun-7", kind: "cún", name: "Chihuahua" }, { id: "cun-8", kind: "cún", name: "Poodle 02" },
    { id: "meo-1", kind: "mèo", name: "Tuxedo" }, { id: "meo-2", kind: "mèo", name: "Calico" },
    { id: "meo-3", kind: "mèo", name: "Tabby 01" }, { id: "meo-4", kind: "mèo", name: "Tabby 02" },
    { id: "meo-5", kind: "mèo", name: "White" }
  ],
  // Nền kem: 6 hoạ tiết × 14 màu, đế bánh 2 màu (tên màu đang đặt tạm theo bảng màu của shop)
  creamPatterns: ["Sao", "Sọc", "Tim", "Chấm bi", "Gợn sóng", "Tam giác"],
  creamColors: [
    { name: "Trắng", hex: "#f4f4f2" }, { name: "Xám đậm", hex: "#55565a" }, { name: "Xanh nhạt", hex: "#d3e4f1" },
    { name: "Hồng", hex: "#f2cdd6" }, { name: "Kem", hex: "#f1eedb" }, { name: "Be", hex: "#d9c8b3" },
    { name: "Đỏ", hex: "#d86f6f" }, { name: "Cam", hex: "#e9a15f" }, { name: "Xám", hex: "#a8a8a8" },
    { name: "Xám nhạt", hex: "#d6d6d6" }, { name: "Nâu", hex: "#6e5d55" }, { name: "Vàng", hex: "#f4c978" },
    { name: "Xanh rêu", hex: "#6e7f4e" }, { name: "Xanh lá", hex: "#8bd08f" }
  ],
  cookieBases: [{ name: "Nâu", hex: "#c3a888" }, { name: "Kem", hex: "#f3ecd6" }],
  // Bảng giá: mỗi dòng ghép mã sản phẩm vẽ theo bé / mẫu sẵn (khớp PRICES trong Code.gs)
  cookieRows: [
    { label: "Móc khoá Cookie", sub: "có click", custom: "cookie-moc-khoa", ready: "san-moc-khoa", cream: true },
    { label: "Pop socket Cookie", sub: "", custom: "cookie-pop", ready: "san-pop", cream: true },
    { label: "Pop socket Cookie", sub: "có click", custom: "cookie-pop-click", ready: "san-pop-click", cream: true }
  ],

  /* ---------- TRANG CHỦ ----------
     5 xấp ảnh rải trên "sổ tay". Mỗi xấp 6 ảnh; ảnh cùng một sản phẩm/khách được kẹp chung (sets).
     link: "#bat" kèm bowl (chọn sẵn dáng bát) hoặc pick (chọn sẵn ô giá cookie); "ig" = mở Instagram */
  home: [
    { id: "bat", title: "bát ăn", note: "3 dáng · khắc tên bé", info: "chống kiến · 8 màu", price: "từ 289K", sets: [
      { name: "Bát Bông", price: "319K", caption: "vừa vặn, dễ thương", link: "#bat", bowl: "bat-bong", imgs: ["images/gallery/bong-1.jpg", "images/gallery/bong-3.jpg"] },
      { name: "Bát Ngôi Sao", price: "289K", caption: "cho bé chân ngắn", link: "#bat", bowl: "bat-sao", imgs: ["images/gallery/sao-1.jpg", "images/gallery/sao-9.jpg"] },
      { name: "Bát Jelly", price: "329K", caption: "cao nhất, cho bé lớn", link: "#bat", bowl: "bat-jelly", imgs: ["images/gallery/jelly-1.jpg", "images/gallery/jelly-4.jpg"] }
    ] },
    { id: "key", title: "keychain thủ công", note: "resin vẽ tay theo bé", info: "vẽ tay theo ảnh bé", price: "199K", sets: [
      { name: "Keychain thủ công", price: "199K", caption: "vẽ tay từ ảnh bé bạn gửi", link: "#keychain", imgs: ["images/gallery/key-1.jpg", "images/gallery/key-3.jpg", "images/gallery/key-4.jpg", "images/gallery/key-2.jpg", "images/gallery/key-12.jpg", "images/gallery/key-8.jpg"] }
    ] },
    { id: "cookie", title: "cookie", note: "mẫu sẵn · vẽ theo bé", info: "13 mẫu sẵn · vẽ theo bé", price: "từ 97K", sets: [
      { name: "Móc khoá Cookie", price: "97K–185K", caption: "có click, kèm dây", link: "#cookie", pick: "san-moc-khoa", imgs: ["images/home/cookie-1.jpg", "images/home/ck-a.jpg", "images/home/ck-d.jpg"] },
      { name: "Pop socket Cookie", price: "110K–218K", caption: "gắn lưng điện thoại", link: "#cookie", pick: "san-pop", imgs: ["images/home/ck-b.jpg", "images/home/cookie-4.jpg", "images/home/ck-c.jpg"] }
    ] },
    { id: "feedback", title: "feedback khách", note: "ảnh các bé gửi về", info: "ảnh thật các bé gửi về", price: "", sets: [
      { name: "Các bé nhà khách", price: "", caption: "ảnh thật khách gửi về", link: "ig", imgs: ["images/feedback/fb-1.jpg", "images/feedback/fb-2.jpg", "images/feedback/fb-3.jpg", "images/feedback/fb-4.jpg", "images/feedback/fb-6.jpg", "images/feedback/fb-7.jpg", "images/feedback/fb-8.jpg", "images/feedback/fb-9.jpg", "images/feedback/fb-10.jpg", "images/feedback/fb-11.jpg", "images/feedback/fb-12.jpg"] }
    ] },
    { id: "noel", title: "noel", note: "charm tự thiết kế", info: "charm tự thiết kế", price: "129K", sets: [
      { name: "Noel Charm 2026", price: "129K", caption: "tự thiết kế trên web riêng", link: "#noel", imgs: ["images/noel/n-1.jpg", "images/noel/n-2.jpg", "images/noel/n-3.jpg", "images/noel/n-4.jpg", "images/noel/n-5.jpg", "images/noel/n-6.jpg", "images/noel/n-7.jpg", "images/noel/n-8.jpg"] }
    ] }
  ],
  // Phần "tất cả sản phẩm": mỗi thẻ mở đúng tab và chọn sẵn món (bowl = dáng bát, pick = ô giá cookie)
  overview: [
    { name: "Bát Bông", price: "319K", note: "18×18cm · cao 12cm", img: "images/gallery/bong-1.jpg", href: "#bat", bowl: "bat-bong" },
    { name: "Bát Ngôi Sao", price: "289K", note: "dáng thấp, bé chân ngắn", img: "images/gallery/sao-1.jpg", href: "#bat", bowl: "bat-sao" },
    { name: "Bát Jelly", price: "329K", note: "cao 16cm, bé lớn", img: "images/gallery/jelly-1.jpg", href: "#bat", bowl: "bat-jelly" },
    { name: "Keychain thủ công", price: "199K", note: "resin vẽ tay theo bé", img: "images/gallery/key-3.jpg", href: "#keychain" },
    { name: "Móc khoá Cookie", price: "97K–185K", note: "13 mẫu sẵn hoặc vẽ theo bé", img: "images/home/cookie-1.jpg", href: "#cookie", pick: "san-moc-khoa" },
    { name: "Pop socket Cookie", price: "110K–218K", note: "gắn lưng điện thoại", img: "images/home/ck-b.jpg", href: "#cookie", pick: "san-pop" },
    { name: "Noel Charm 2026", price: "129K", note: "tự thiết kế trên web riêng", img: "images/home/noel-1.jpg", href: "#noel" }
  ],

  // Ảnh tham khảo từng sản phẩm (images/gallery/<nhóm>-<số>.jpg, ảnh nhỏ: <nhóm>-<số>-s.jpg)
  gallery: {
    bong: [1, 2, 3, 4, 5, 6, 7, 8], sao: [1, 2, 3, 4, 5, 12, 8, 9, 10, 11], jelly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 11],
    key: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], cookie: [1, 2, 3, 4, 5, 6, 7, 8], noel: [1, 2, 3, 5, 6, 7, 8]
  },

  // ảnh xếp thành cây thông tem ở phần Noel
  noelTree: ["images/home/noel-1.jpg", "images/home/noel-7580.jpg", "images/home/noel-7582.jpg", "images/home/noel-3.jpg", "images/home/noel-4.jpg"],

  products: [
    /* ---------- BÁT ---------- */
    { id: "bat-sao", group: "living", type: "bowl", name: "Bát Ngôi Sao", price: 289000,
      images: ["images/gallery/sao-1.jpg"], specs: ["Nghiêng 10°", "Ngăn nước chống kiến, tháo lắp được", "Đệm silicon chống trượt"], lead: "2–5 ngày" },
    { id: "bat-bong", group: "living", type: "bowl", name: "Bát Bông", price: 319000,
      images: ["images/home/bong-hero.jpg"], specs: ["Nghiêng 10°", "Ngăn nước chống kiến, tháo lắp được", "Đệm silicon chống trượt"], lead: "2–5 ngày" },
    { id: "bat-jelly", group: "living", type: "bowl", name: "Bát Jelly", price: 329000,
      images: ["images/gallery/jelly-1.jpg"], specs: ["Nghiêng 10°", "Ngăn nước chống kiến, tháo lắp được", "Đệm silicon chống trượt"], lead: "2–5 ngày" },

    /* ---------- VẼ THEO BÉ ---------- */
    { id: "moc-khoa-resin", group: "custom", type: "custom", name: "Keychain thủ công (resin vẽ tay)", price: 199000, images: ["images/gallery/key-3.jpg"], lead: "4–7 ngày" },
    { id: "cookie-moc-khoa", group: "custom", type: "custom", name: "Móc khoá Cookie vẽ theo bé", price: 185000, images: ["images/home/cookie-1.jpg"], lead: "4–7 ngày" },
    { id: "cookie-pop", group: "custom", type: "custom", name: "Pop socket Cookie vẽ theo bé", price: 198000, images: ["images/home/ck-b.jpg"], lead: "4–7 ngày" },
    { id: "cookie-pop-click", group: "custom", type: "custom", name: "Pop socket Cookie có click, vẽ theo bé", price: 218000, images: ["images/home/ck-b.jpg"], lead: "4–7 ngày" },

    /* ---------- COOKIE MẪU SẴN ---------- */
    { id: "san-moc-khoa", group: "ready", type: "ready", name: "Móc khoá Cookie mẫu sẵn", price: 97000, images: ["images/cookie/cun-5.jpg"], lead: "4–7 ngày" },
    { id: "san-pop", group: "ready", type: "ready", name: "Pop socket Cookie mẫu sẵn", price: 110000, images: ["images/cookie/meo-2.jpg"], lead: "4–7 ngày" },
    { id: "san-pop-click", group: "ready", type: "ready", name: "Pop socket Cookie có click, mẫu sẵn", price: 130000, images: ["images/cookie/meo-2.jpg"], lead: "4–7 ngày" },

    /* ---------- NOEL (đặt qua web thiết kế riêng) ---------- */
    { id: "noel-charm", group: "noel", type: "noel", name: "Noel Charm 2026", price: 129000, images: ["images/noel-charm.jpg"], lead: "4–7 ngày" }
  ]
};
