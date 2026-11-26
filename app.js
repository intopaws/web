/* intoPaws Studio — shop front-end (giấy can × nhãn xanh × kẹp tim) */
(function () {
  const C = window.INTOPAWS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = n => n.toLocaleString("vi-VN") + "đ";
  const k = n => Math.round(n / 1000) + "K";
  const byId = id => C.products.find(p => p.id === id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pickOne = arr => arr[Math.floor(Math.random() * arr.length)];
  const HEART = '<svg class="heart" aria-hidden="true"><use href="#heartclip"/></svg>';
  const root = document.documentElement;

  /* ============ giảm chuyển động ============ */
  let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try { const s = localStorage.getItem("ip_motion"); if (s) reduced = s === "off"; } catch (e) {}
  const motionBtn = $("#motionBtn");
  function applyMotion() {
    root.classList.toggle("reduce-motion", reduced);
    root.classList.toggle("motion-on", !reduced);
    motionBtn.setAttribute("aria-pressed", String(reduced));
    motionBtn.textContent = reduced ? "[ bật chuyển động ]" : "[ tắt chuyển động ]";
  }
  motionBtn.onclick = () => { reduced = !reduced; try { localStorage.setItem("ip_motion", reduced ? "off" : "on"); } catch (e) {} applyMotion(); };
  applyMotion();
  // chạy animation; có hẹn giờ dự phòng để nút bấm không bị kẹt khi trình duyệt tạm dừng animation
  const anim = (el, kf, o) => {
    if (reduced) return Promise.resolve();
    const a = el.animate(kf, o), limit = (o.delay || 0) + o.duration + 300;
    // quá giờ mà animation chưa xong (trình duyệt tạm dừng): nhảy thẳng tới trạng thái cuối.
    // KHÔNG đụng tới animation đã bị huỷ (idle): finish() sẽ chạy lại nó, vd. làm khung xấp ảnh mới mở bị mờ hẳn
    return Promise.race([a.finished.catch(() => {}), new Promise(r => setTimeout(() => { try { if (a.playState === "running" || a.playState === "paused") a.finish(); } catch (e) {} r(); }, limit))]);
  };

  /* ============ dải tên chạy ngang ============ */
  const MQ = [["bát bông", 319000, "#bat", "bat-bong"], ["bát ngôi sao", 289000, "#bat", "bat-sao"], ["bát jelly", 329000, "#bat", "bat-jelly"],
    ["keychain thủ công", 199000, "#cookie", null, "moc-khoa-resin"], ["móc khoá cookie", 97000, "#cookie", null, "san-moc-khoa"],
    ["pop socket cookie", 110000, "#cookie", null, "san-pop"], ["noel charm", 129000, "#noel"]];
  const mqHTML = dup => MQ.map(([n, p, href, bowl, pick]) =>
    `<a href="${href}" class="${dup ? "dup" : ""}"${bowl ? ` data-bowl="${bowl}"` : ""}${pick ? ` data-pick="${pick}"` : ""}${dup ? ' aria-hidden="true" tabindex="-1"' : ""}>${esc(n)}<sup>[ ${k(p)} ]</sup></a>`).join("");
  $("#marquee").innerHTML = mqHTML(false) + mqHTML(true);

  /* ============ trang chủ: khung sổ tay + folder ============ */
  const board = $("#board"), folder = $("#folder");
  const VAR = ["", "veil", ""];
  const FAN = [[-5, 4, -8], [7, -5, 6], [-8, 7, -3]];
  // vị trí khi folder mở (tỉ lệ theo khung), theo thứ tự: bát, keychain, cookie, feedback, noel
  const OPEN = { wide: [[.05, .14, -7], [.29, .52, 6], [.47, .08, -4], [.66, .5, 8], [.82, .12, -9]],
                 narrow: [[.04, .1, -7], [.56, .14, 6], [.08, .45, 5], [.55, .5, -6], [.3, .74, 4]] };
  const clusters = C.home.map((g, gi) => {
    const imgs = g.sets.flatMap(s => s.imgs);
    const el = document.createElement("button");
    el.type = "button";
    el.className = "cluster c-" + g.id;
    el.setAttribute("aria-label", `Mở xấp ${g.title}, ${imgs.length} ảnh`);
    el.style.setProperty("--d", gi * -1.3 + "s");
    // ảnh, nhãn và kẹp tim nằm chung một khối .cw nên trôi / xào cùng nhau như một xấp thật
    el.innerHTML = `<span class="cw">${imgs.slice(0, 3).map((src, i) => `
        <span class="cp ${VAR[i]}" style="--i:${i};--dx:${FAN[i][0]}px;--dy:${FAN[i][1]}px;--rr:${FAN[i][2]}deg;--fx:${(i - 1) * 26}px;--fy:${-Math.abs(i - 1) * 6 - 6}px;--fr:${(i - 1) * 9}deg;z-index:${3 - i}">
          <img src="${src}" alt=""></span>`).join("")}
        <span class="vellum c-tag"><span class="v-title">${esc(g.title)}</span></span>${HEART}
        <span class="c-info"><span class="i">${esc(g.info)}</span>${g.price ? `<span class="p">${esc(g.price)}</span>` : ""}</span>
      </span>`;
    el.onclick = () => openDesk(g, el);
    board.insertBefore(el, folder);
    return el;
  });
  // đồ lặt vặt trên bàn: chỉ ảnh rời và vài ngôi sao đơn giản tô đặc
  const LOOSE = [
    ["snap", "images/home/noel-7580.jpg"], ["snap", "images/home/feedback-3.jpg"], ["snap", "images/home/key-4.jpg"],
    ["snap", "images/home/bat-f.jpg"], ["snap", "images/home/ck-c.jpg"], ["snap", "images/home/feedback-5.jpg"],
    ["star-s", "#C9A882"], ["star-s", "#B3C4CE"], ["star-s", "#A6886B"], ["star-s", "#738E9D"]
  ];
  const loose = LOOSE.map(([cls, val]) => {
    const el = document.createElement("span");
    el.className = "loose " + cls;
    el.setAttribute("aria-hidden", "true");
    if (cls === "snap") el.innerHTML = `<img src="${val}" alt="">`;
    else { el.style.color = val; el.innerHTML = '<svg viewBox="0 0 24 24"><use href="#star"/></svg>'; }
    board.insertBefore(el, folder);
    return el;
  });
  const isNarrow = () => board.clientWidth < 560;
  const place = (el, x, y, r) => { el.style.setProperty("--x", x + "px"); el.style.setProperty("--y", y + "px"); el.style.setProperty("--r", r + "deg"); };
  const dims = el => [el.offsetWidth || 80, el.offsetHeight || 80];
  // folder đóng: các xấp nhét trong folder, chỉ ló phần trên; đồ lặt vặt nằm quanh mép folder
  function layoutClosed() {
    // dùng vị trí cố định của folder khi đóng (không đo lúc folder còn đang trải rộng ra)
    const W = board.clientWidth, H = board.clientHeight, n = isNarrow();
    const fx = W * (n ? .08 : .23), fw = W * (n ? .84 : .54), fy = H * (n ? .16 : .15);
    const cw = clusters[0].offsetWidth;
    clusters.forEach((el, i) => place(el, fx + 8 + (fw - cw - 16) * (i / (clusters.length - 1)), fy + 26 + (i % 2) * 22 + rand(-6, 6), rand(-12, 12).toFixed(1)));
    loose.forEach((el, i) => {
      const [w, h] = dims(el), left = i % 2 === 0;
      const x = left ? rand(6, Math.max(8, fx - w * .4)) : rand(Math.min(W - w - 6, fx + fw - w * .5), W - w - 6);
      place(el, x, rand(30, H - h - 10), rand(-35, 35).toFixed(0));
    });
  }
  function layoutOpen() {
    const W = board.clientWidth, H = board.clientHeight, cw = clusters[0].offsetWidth, ch = clusters[0].offsetHeight;
    const maxY = H * .86 - ch;   // chừa dải nắp folder ở đáy
    (isNarrow() ? OPEN.narrow : OPEN.wide).forEach(([x, y, r], i) => place(clusters[i], Math.min(W - cw - 36, Math.max(36, x * W)), Math.min(maxY, y * H + 30), r));
    loose.forEach(el => { const [w, h] = dims(el); place(el, rand(4, W - w - 4), rand(20, H * .86 - h), rand(-40, 40).toFixed(0)); });
  }
  let folderOpen = false;
  function setFolder(open) {
    folderOpen = open;
    board.classList.toggle("open", open); board.classList.toggle("closed", !open);
    folder.setAttribute("aria-expanded", String(open));
    folder.setAttribute("aria-label", open ? "Cất các xấp ảnh vào lại folder" : "Mở folder sổ tay intoPaws để xem các xấp ảnh");
    $("#btnFolder").textContent = open ? "cất vào folder ↑" : "mở folder ↓";
    $("#boardHint").textContent = open ? "chạm vào một xấp ảnh để xem chi tiết" : "chạm vào folder để mở";
    clusters.forEach(el => { el.tabIndex = open ? 0 : -1; });
    if (open) board.classList.add("used");   // đã biết cách mở: thôi hiện con trỏ chỉ dẫn
    if (open) {
      layoutOpen();
      clusters.forEach((el, i) => anim(el.querySelector(".cw"), [{ transform: "translateY(60px) scale(.8)" }, { transform: "translateY(-14px) scale(1.05)", offset: .6 }, { transform: "none" }], { duration: 700, delay: i * 70, easing: "ease-out" }));
    } else layoutClosed();
  }
  folder.onclick = () => setFolder(!folderOpen);
  // trong lúc nắp folder đang trượt, cho bấm xuyên qua nắp xuống xấp ảnh bên dưới
  const _setFolder = setFolder;
  setFolder = open => { _setFolder(open); folder.style.pointerEvents = "none"; clearTimeout(folder._t); folder._t = setTimeout(() => { folder.style.pointerEvents = ""; }, reduced ? 0 : 800); };
  board.addEventListener("click", e => { if (!folderOpen && !e.target.closest("#folder")) setFolder(true); });
  $("#btnFolder").onclick = () => setFolder(!folderOpen);
  // "xáo tung": mở folder nếu đang đóng, rồi quăng mọi thứ đi khắp bàn, xoay mạnh
  $("#btnMess").onclick = () => {
    if (!folderOpen) setFolder(true);
    const W = board.clientWidth, H = board.clientHeight;
    board.classList.remove("shake"); void board.offsetWidth; board.classList.add("shake");
    clusters.forEach(el => {
      const cw = el.offsetWidth, ch = el.offsetHeight;
      place(el, rand(36, W - cw - 36), rand(34, H * .86 - ch), rand(-28, 28).toFixed(1));   // chừa mép để thẻ giá lệch ngang không bị cắt
      anim(el.querySelector(".cw"), [{ transform: "none" }, { transform: `rotate(${rand(-220, 220)}deg) scale(1.18)`, offset: .45 }, { transform: "none" }], { duration: 850, easing: "cubic-bezier(.3,.7,.3,1)" });
      el.classList.remove("riffle"); void el.offsetWidth; el.classList.add("riffle");
    });
    loose.forEach(el => {
      const [w, h] = dims(el);
      place(el, rand(0, W - w), rand(10, H - h), rand(-80, 80).toFixed(0));
      anim(el, [{ scale: "1" }, { scale: "1.4", offset: .4 }, { scale: "1" }], { duration: 700, easing: "ease-out" });
    });
  };
  let rto;
  window.addEventListener("resize", () => { clearTimeout(rto); rto = setTimeout(() => folderOpen ? layoutOpen() : layoutClosed(), 150); });
  setFolder(false);
  requestAnimationFrame(() => { if (!folderOpen) layoutClosed(); });

  /* ----- mở một xấp thành lưới: bay ra, lật, ghim rơi ----- */
  const desk = $("#desk"), deskSets = $("#deskSets");
  const PIN = ["#A6886B", "#738E9D", "#B3C4CE", "#FBFBFA", "#3E2A21", "#C9A882"];
  let openG = null, openEl = null, deskBusy = false, closing = false;
  const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width]; };
  function pinsHTML(g) {
    const n = Math.random() < .55 ? 1 : (Math.random() < .5 ? 0 : 2);
    const colors = g.id === "noel" ? [...PIN, "#D34238", "#D34238"] : PIN;
    return Array.from({ length: n }, () => `<i class="pin" style="--pl:${rand(14, 80).toFixed(0)}%;--pt:${rand(3, 14).toFixed(0)}%;--pc:${pickOne(colors)}"></i>`).join("");
  }
  function linkHTML(s) {
    if (s.link === "ig") return `<a class="pill mono" href="${C.contact.instagram}" target="_blank" rel="noopener">[ xem thêm trên IG ↗ ]</a>`;
    return `<a class="pill mono" href="${s.link}"${s.bowl ? ` data-bowl="${s.bowl}"` : ""}${s.pick ? ` data-pick="${s.pick}"` : ""}>[ chọn món này → ]</a>`;
  }
  function buildDesk(g) {
    deskSets.innerHTML = g.sets.map(s => `
      <div class="set">${HEART}
        <span class="vellum set-tag"><span class="t">${esc(s.name)}</span>${s.price ? `<span class="mono">[ ${esc(s.price)} ]</span>` : ""}</span>
        <div class="set-photos">${s.imgs.map((src, i) => `
          <div class="slot" style="--r:${rand(-6, 6).toFixed(1)}deg">
            <div class="card">
              <div class="face front">
                <img src="${src}" alt="${esc(s.name)}, ảnh ${i + 1}">
                <span class="pins">${pinsHTML(g)}</span>
                <button type="button" class="flip-hit" aria-label="Lật ảnh ${esc(s.name)} ${i + 1} xem mặt sau"></button>
              </div>
              <div class="face back" aria-hidden="true">
                <p class="script">${esc(s.caption)}</p>
                <p class="b-name">${esc(s.name)}</p>
                ${s.price ? `<p class="mono">[ ${esc(s.price)} ]</p>` : ""}
                <button type="button" class="pill mono flip-back" aria-label="Lật lại mặt trước">[ lật lại ↺ ]</button>
              </div>
            </div>
          </div>`).join("")}
        </div>
        <div class="set-go">${linkHTML(s)}</div>
      </div>`).join("");
    $$(".back a, .back button", deskSets).forEach(x => x.tabIndex = -1);
  }
  function flip(card, on) {
    card.classList.toggle("flipped", on);
    card._flippedAt = Date.now();   // chống chạm nhầm vào nút ngay sau khi lật
    card.querySelector(".back").setAttribute("aria-hidden", String(!on));
    card.querySelectorAll(".back a, .back button").forEach(x => x.tabIndex = on ? 0 : -1);
    card.querySelector(".flip-hit").tabIndex = on ? -1 : 0;
    (on ? card.querySelector(".flip-back") : card.querySelector(".flip-hit")).focus({ preventScroll: true });
  }
  // chạm mặt trước: lật ra sau; chạm bất kỳ đâu ở mặt sau (trừ link): lật lại
  deskSets.addEventListener("click", e => {
    const card = e.target.closest(".card");
    if (!card || e.target.closest("a")) return;
    flip(card, !card.classList.contains("flipped"));
  });
  function dealIn(fromXY, stagger = 80) {
    return Promise.all($$(".card", deskSets).map((card, i) => {
      const [cx, cy, w] = center(card.parentElement);
      $$(".pin", card).forEach(p => anim(p, [{ transform: "translateY(-46px) scale(1.7)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 300, delay: i * stagger + 640 + rand(0, 160), easing: "cubic-bezier(.34,1.5,.64,1)", fill: "backwards" }));
      return anim(card, [
        { transform: `translate(${fromXY[0] - cx}px,${fromXY[1] - cy}px) scale(${Math.min(.6, 110 / w)}) rotate(${rand(-28, 28)}deg) rotateY(180deg)`, opacity: 0 },
        { opacity: 1, offset: .2 },
        { transform: `translate(0,-22px) rotate(${rand(-4, 4)}deg) rotateY(-12deg)`, offset: .72 },
        { transform: "none" }
      ], { duration: 780, delay: i * stagger, easing: "cubic-bezier(.2,.75,.25,1)", fill: "backwards" });
    }));
  }
  let deskGen = 0;   // mỗi lần mở là một lượt mới; lượt đóng cũ đang chạy dở sẽ tự dừng
  function finishCloseNow() {
    desk.getAnimations().forEach(a => a.cancel());
    desk.hidden = true; deskSets.innerHTML = ""; desk.style.pointerEvents = "";
    document.body.classList.remove("desk-open");
    if (openEl) openEl.classList.remove("opened");
    closing = deskBusy = false;
  }
  async function openDesk(g, el) {
    if (closing) finishCloseNow();          // đang gom xấp trước: đóng ngay để mở xấp mới
    else if (deskBusy) return;
    const gen = ++deskGen;
    deskBusy = true; openG = g; openEl = el; desk.style.pointerEvents = "";
    buildDesk(g);
    $("#deskTitle").textContent = g.title;
    const total = g.sets.reduce((a, s) => a + s.imgs.length, 0);
    $("#deskCount").textContent = `[ ${String(total).padStart(2, "0")} ẢNH · ${g.note.toUpperCase()} ]`;
    desk.hidden = false; desk.scrollTop = 0;
    document.body.classList.add("desk-open");
    const from = center(el);
    el.classList.add("opened");
    anim(desk, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
    $("#deskClose").focus({ preventScroll: true });
    await dealIn(from);
    if (gen === deskGen) deskBusy = false;
  }
  async function closeDesk(instant) {
    if (desk.hidden || closing) return;
    closing = deskBusy = true;
    const gen = deskGen;
    if (!instant) desk.style.pointerEvents = "none";   // đang gom: cho bấm xuyên xuống các xấp khác
    $$(".card, .pin", deskSets).forEach(x => x.getAnimations().forEach(a => a.cancel()));
    if (!instant && openEl) {
      const to = center(openEl), cards = $$(".card", deskSets).reverse();
      await Promise.all(cards.map((card, i) => {
        const [cx, cy, w] = center(card.parentElement);
        return anim(card, [{ transform: "none" }, { transform: `translate(${to[0] - cx}px,${to[1] - cy}px) scale(${Math.min(.6, 110 / w)}) rotate(${rand(-20, 20)}deg) rotateY(160deg)`, opacity: 0 }],
          { duration: 460, delay: i * 45, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" });
      }));
      if (gen !== deskGen) return;   // khách đã mở xấp khác trong lúc gom
      await anim(desk, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" });
      if (gen !== deskGen) return;
    }
    desk.getAnimations().forEach(a => a.cancel());
    desk.hidden = true; deskSets.innerHTML = ""; desk.style.pointerEvents = "";
    document.body.classList.remove("desk-open");
    if (openEl) {
      openEl.classList.remove("opened");
      if (!instant) { openEl.classList.remove("riffle"); void openEl.offsetWidth; openEl.classList.add("riffle"); openEl.focus({ preventScroll: true }); }
    }
    closing = deskBusy = false;
  }
  async function reshuffle() {
    if (deskBusy || !openG) return;
    deskBusy = true;
    const cards = $$(".card", deskSets), vc = [innerWidth / 2, innerHeight / 2];
    await Promise.all(cards.map((card, i) => {
      const [cx, cy] = center(card.parentElement);
      card._d = [vc[0] - cx, vc[1] - cy];
      card._to = `translate(${card._d[0]}px,${card._d[1]}px) rotate(${rand(-10, 10).toFixed(1)}deg) scale(.7)`;
      return anim(card, [{ transform: "none" }, { transform: card._to }], { duration: 340, delay: i * 30, easing: "cubic-bezier(.5,0,.3,1)", fill: "forwards" });
    }));
    await Promise.all(cards.map((card, i) => {
      const [x, y] = card._d, side = i % 2 ? 1 : -1;
      return anim(card, [
        { transform: card._to },
        { transform: `translate(${x + side * 90}px,${y - 10}px) rotate(${side * 12}deg) scale(.7)`, offset: .3 },
        { transform: `translate(${x - side * 14}px,${y + 4}px) rotate(${-side * 4}deg) scale(.7)`, offset: .62 },
        { transform: `translate(${x + side * 50}px,${y - 6}px) rotate(${side * 7}deg) scale(.7)`, offset: .8 },
        { transform: `translate(${x}px,${y}px) rotate(0deg) scale(.7)` }
      ], { duration: 620, delay: i * 18, easing: "ease-in-out", fill: "forwards" });
    }));
    if (closing) return;
    cards.forEach(card => {
      card.parentElement.style.setProperty("--r", rand(-6, 6).toFixed(1) + "deg");
      card.querySelector(".pins").innerHTML = pinsHTML(openG);
      if (card.classList.contains("flipped")) flip(card, false);
      card.getAnimations().forEach(a => a.cancel());
    });
    await dealIn(vc, 55);
    deskBusy = false;
  }
  $("#deskClose").onclick = () => closeDesk(false);
  $("#deskShuffle").onclick = reshuffle;
  desk.addEventListener("click", e => {
    // chỉ đóng khi bấm ra vùng tối bên ngoài khung (khoảng trống giữa các nhóm ảnh không đóng)
    if (e.target === desk) { closeDesk(false); return; }
    const a = e.target.closest("a[href^='#']");
    if (a) {
      e.preventDefault();
      const card = a.closest(".card");
      if (card && Date.now() - (card._flippedAt || 0) < 500) return;   // vừa lật xong: bỏ qua, tránh văng ra
      closeDesk(true);
      goTo(a.getAttribute("href"));
    }
  });
  document.addEventListener("keydown", e => {
    if (desk.hidden) return;
    if (e.key === "Escape") closeDesk(false);
    if (e.key === "Tab") {
      const f = $$("button:not([tabindex='-1']), a:not([tabindex='-1'])", desk).filter(x => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ============ tất cả sản phẩm ============ */
  $("#overview").innerHTML = C.overview.map((o, i) => `
    <a class="ov-card cat-${{ "#bat": "bat", "#cookie": "ck", "#noel": "noel" }[o.href] || "bat"}" href="${o.href}"${o.bowl ? ` data-bowl="${o.bowl}"` : ""}${o.pick ? ` data-pick="${o.pick}"` : ""} style="--r:${[-1.5, 1, -.8, 1.4, -1, .8, -1.2][i % 7]}deg">
      <span class="ov-img"><img src="${o.img}" alt="" loading="lazy"></span>
      <span class="ov-name">${esc(o.name)}</span>
      <span class="ov-note">${esc(o.note)}</span>
      <span class="ov-row"><span class="ov-price">${esc(o.price)}</span><span class="ov-go mono">xem &amp; đặt →</span></span>
    </a>`).join("");

  // mục "tất cả sản phẩm" đóng sẵn, bấm mới mở
  const ovToggle = $("#ovToggle"), ovBody = $("#ovBody");
  function setOverview(open) {
    ovBody.hidden = !open;
    ovToggle.setAttribute("aria-expanded", String(open));
    $("#ovBtnTxt").textContent = open ? "thu gọn −" : "mở ra +";
    if (open) $$(".ov-card", ovBody).forEach((c, i) => anim(c, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: `rotate(${c.style.getPropertyValue("--r")})` }], { duration: 320, delay: i * 40, easing: "ease-out", fill: "backwards" }));
  }
  ovToggle.onclick = () => setOverview(ovBody.hidden);
  // link tới #tat-ca (menu "sản phẩm", nút "xem tất cả") thì mở luôn
  document.addEventListener("click", e => { if (e.target.closest('a[href="#tat-ca"]')) setOverview(true); });

  /* ============ menu: đánh dấu mục đang xem ============ */
  const menuLinks = $$("#menu a");
  function markMenu(id) {
    menuLinks.forEach(a => { if (a.dataset.nav === id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    const cur = menuLinks.find(a => a.dataset.nav === id);
    const m = $("#menu");
    if (cur && m.scrollWidth > m.clientWidth) m.scrollLeft = cur.offsetLeft - m.clientWidth / 2 + cur.offsetWidth / 2;
  }
  // khi cuộn: lên đầu trang → "trang chủ", tới phần tất cả sản phẩm → "tất cả sản phẩm", tới khu tab → tab đang mở
  const watch = [["top", $("#top")], ["tat-ca", $("#tat-ca")], ["shop", $(".shop")]];
  if ("IntersectionObserver" in window) {
    const seen = new Map();
    const io2 = new IntersectionObserver(es => {
      es.forEach(en => seen.set(en.target, en.isIntersecting ? en.intersectionRatio : 0));
      let best = null, v = 0;
      watch.forEach(([id, el]) => { const r = seen.get(el) || 0; if (r > v) { v = r; best = id; } });
      if (best) markMenu(best === "shop" ? (tabs.find(t => t.getAttribute("aria-selected") === "true") || tabs[0]).getAttribute("aria-controls") : best);
    }, { threshold: [0, .15, .3, .6] });
    watch.forEach(([, el]) => io2.observe(el));
  }

  /* ============ tab sản phẩm ============ */
  const tabs = $$("#tabs [role=tab]"), PANELS = tabs.map(t => t.getAttribute("aria-controls"));
  function showTab(id) {
    if (!PANELS.includes(id)) return false;
    tabs.forEach(t => { const on = t.getAttribute("aria-controls") === id; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
    PANELS.forEach(p => { $("#" + p).hidden = p !== id; });
    // chuyển tab: chỉ hiện mờ dần thật nhẹ
    anim($("#" + id), [{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
    markMenu(id);
    // khung trong tab vừa mở: hiện luôn, không chờ trình duyệt báo cuộn
    $$("#" + id + " .reveal:not(.in)").forEach(el => el.classList.add("in"));
    if (id === "noel") noelSeen();
    return true;
  }
  function goTo(hash) {
    const id = (hash || "").replace("#", "");
    if (id === "top") { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); return; }
    if (showTab(id)) $("#tabs").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }
  tabs.forEach((t, i) => {
    t.onclick = () => showTab(t.getAttribute("aria-controls"));
    t.onkeydown = e => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); n.click(); }
    };
  });
  // link #bat/#cookie/#noel/#dat-hang mở đúng tab; data-bowl / data-pick chọn sẵn món
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href^='#']");
    if (!a) return;
    if (a.dataset.bowl) selectBowl(a.dataset.bowl);
    if (a.dataset.pick) choosePrice(a.dataset.pick);
    if (a.closest("#desk")) return;
    const id = a.getAttribute("href").slice(1);
    if (PANELS.includes(id) || id === "top") { e.preventDefault(); goTo("#" + id); }
  });

  /* ============ ảnh tham khảo + xem ảnh lớn ============ */
  const lb = $("#lightbox"), lbImg = $("#lbImg");
  let lbList = [], lbIdx = 0, lbName = "";
  function lbShow(i) {
    lbIdx = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIdx]; lbImg.alt = `${lbName}, ảnh ${lbIdx + 1}`;
    $("#lbCap").textContent = `${lbName} · ${lbIdx + 1} / ${lbList.length}`;
  }
  function openLightbox(list, i, name) { lbList = list; lbName = name; lbShow(i); if (!lb.open) lb.showModal(); }
  $("#lbClose").onclick = () => lb.close();
  $("#lbPrev").onclick = () => lbShow(lbIdx - 1);
  $("#lbNext").onclick = () => lbShow(lbIdx + 1);
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });   // bấm ra ngoài để đóng
  lb.addEventListener("keydown", e => { if (e.key === "ArrowLeft") lbShow(lbIdx - 1); if (e.key === "ArrowRight") lbShow(lbIdx + 1); });
  let sx = null;   // vuốt ngang trên điện thoại
  lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => { if (sx === null) return; const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 40) lbShow(lbIdx + (d < 0 ? 1 : -1)); sx = null; });
  // vẽ một dải ảnh nhỏ; chạm ảnh nào thì mở xem lớn từ ảnh đó
  function renderGallery(box, key, name) {
    const nums = C.gallery[key] || [];
    const big = nums.map(n => `images/gallery/${key}-${n}.jpg`);
    box.innerHTML = nums.map((n, i) => `<button type="button" class="g-thumb" data-i="${i}" aria-label="Xem ảnh ${i + 1} của ${esc(name)}"><img src="images/gallery/${key}-${n}-s.jpg" alt="" loading="lazy"></button>`).join("");
    box.querySelectorAll(".g-thumb").forEach(b => b.onclick = () => openLightbox(big, +b.dataset.i, name));
    box.dataset.key = key;
  }
  const GAL_BOWL = { "bat-bong": "bong", "bat-sao": "sao", "bat-jelly": "jelly" };

  // note + giá nảy nhẹ khi đổi món
  function popNote(card, tape) {
    if (card) anim(card, [{ opacity: .3, transform: "rotate(1.5deg) translateY(-10px) scale(.96)" }, { opacity: 1, transform: "rotate(1.5deg)" }], { duration: 420, easing: "cubic-bezier(.34,1.4,.64,1)" });
    if (tape) anim(tape, [{ transform: "rotate(-2deg) scale(1.18)" }, { transform: "rotate(-2deg) scale(1)" }], { duration: 380, easing: "cubic-bezier(.34,1.6,.64,1)" });
  }
  // note thông tin cho từng món cookie / keychain (chỉ dùng thông tin shop đã có)
  function paintCookieNote(pid) {
    const row = pid && C.cookieRows.find(r => r.custom === pid || r.ready === pid);
    const price = id => id ? k(byId(id).price) : "–";
    let name = "cookie & keychain", rows, tag = "từ 97K";
    if (!row) rows = [["mẫu sẵn", "13 bé cún & mèo"], ["vẽ theo bé", "từ ảnh bạn gửi"], ["nền kem", "6 hoạ tiết · 14 màu"], ["đế bánh", "nâu hoặc kem"], ["hoàn thiện", "4–7 ngày"]];
    else {
      name = row.label.toLowerCase();
      rows = [["vẽ theo bé", price(row.custom)], ["mẫu sẵn", price(row.ready)]];
      if (row.sub === "có click") rows.push(["có", "click"]);
      if (row.custom === "moc-khoa-resin") rows.push(["chất liệu", "resin vẽ tay"], ["vẽ từ", "ảnh bé bạn gửi"]);
      if (row.cream) rows.push(["nền kem", "6 hoạ tiết · 14 màu"], ["đế bánh", "nâu hoặc kem"]);
      rows.push(["duyệt bản vẽ", "trước khi làm"], ["hoàn thiện", "4–7 ngày"]);
      tag = k(byId(pid).price);
    }
    $("#ckName").textContent = name;
    $("#ckTags").innerHTML = rows.map(([a, b]) => `<li><span class="k">${esc(a)}</span><span class="v">${esc(b)}</span></li>`).join("");
    $("#ckPrice").textContent = tag;
    popNote($(".ck-card"), $("#ckPrice"));
  }
  // ảnh bay vào giỏ khi thêm hàng
  function flyToCart(src) {
    if (reduced || !src) return;
    const from = document.activeElement && document.activeElement.closest("form") ? document.activeElement.getBoundingClientRect() : null;
    const to = $("#cartBtn").getBoundingClientRect();
    if (!from) return;
    const img = document.createElement("img");
    img.src = src; img.className = "fly-img"; img.alt = "";
    img.style.cssText = `left:${from.left + from.width / 2 - 30}px;top:${from.top - 20}px`;
    document.body.appendChild(img);
    anim(img, [{ transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 },
      { transform: `translate(${(to.left - from.left) * .5}px, ${(to.top - from.top) * .5 - 80}px) scale(.8) rotate(-12deg)`, opacity: 1, offset: .5 },
      { transform: `translate(${to.left + to.width / 2 - from.left - from.width / 2}px, ${to.top - from.top + 20}px) scale(.2) rotate(8deg)`, opacity: .4 }],
      { duration: 800, easing: "cubic-bezier(.45,0,.3,1)" }).then(() => img.remove());
  }
  // khung, thẻ hiện dần khi cuộn tới
  const revealIO = "IntersectionObserver" in window && !reduced ? new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); }
  }), { threshold: .12 }) : null;
  function watchReveal(root) {
    $$(".frame-page:not(.panel), .box, .step, .ov-foot", root || document).forEach((el, i) => {
      if (!revealIO || el.classList.contains("in")) return;
      el.classList.add("reveal"); el.style.setProperty("--rd", (i % 4) * 70 + "ms"); revealIO.observe(el);
    });
  }
  // khung trượt ảnh: ảnh lớn + nút ‹ › để qua ảnh khác; chạm ảnh để xem lớn
  // dir: 1 = qua ảnh sau (ảnh mới trượt từ phải vào), -1 = ảnh trước
  function carShow(fig, dir = 0) {
    const img = fig.querySelector("img"), src = fig._list[fig._i];
    fig.querySelector(".car-count").textContent = `${String(fig._i + 1).padStart(2, "0")} / ${String(fig._list.length).padStart(2, "0")}`;
    img.alt = `${fig._name}, ảnh ${fig._i + 1}`;
    if (img.getAttribute("src") === src) return;
    img.src = src;
    anim(img, [{ opacity: 0, transform: `translateX(${dir * 28}px) scale(${dir ? 1 : 1.03})` }, { opacity: 1, transform: "none" }], { duration: 380, easing: "cubic-bezier(.2,.7,.2,1)" });
    const sp = $("#" + fig.dataset.spread);
    if (sp) sp.querySelectorAll(".g-thumb").forEach((t, i) => t.classList.toggle("on", i === fig._i));
  }
  function loadCarousel(fig, key, name) {
    fig._list = (C.gallery[key] || []).map(n => `images/gallery/${key}-${n}.jpg`);
    fig._name = name; fig._i = 0; fig.dataset.key = key;
    carShow(fig);
    const sp = $("#" + fig.dataset.spread);
    if (sp && !sp.hidden) paintSpread(fig, sp);
  }
  // "dàn ra tất cả ảnh": trải ảnh thành lưới nhỏ (bay ra lần lượt); "đóng lại" gom vào
  function paintSpread(fig, sp) {
    sp.innerHTML = fig._list.map((src, i) => `<button type="button" class="g-thumb${i === fig._i ? " on" : ""}" data-i="${i}" aria-label="Xem ảnh ${i + 1} của ${esc(fig._name)}"><img src="${src.replace(".jpg", "-s.jpg")}" alt="" loading="lazy"></button>`).join("");
    sp.querySelectorAll(".g-thumb").forEach((b, i) => {
      b.onclick = () => { const d = +b.dataset.i > fig._i ? 1 : -1; fig._i = +b.dataset.i; carShow(fig, d); };
      anim(b, [{ opacity: 0, transform: `translateY(-18px) rotate(${rand(-12, 12)}deg) scale(.8)` }, { opacity: 1, transform: "none" }], { duration: 420, delay: i * 45, easing: "cubic-bezier(.34,1.4,.64,1)", fill: "backwards" });
    });
  }
  $$(".spread-btn").forEach(btn => {
    const fig = $("#" + btn.dataset.for), sp = $("#" + btn.dataset.spread);
    fig.dataset.spread = sp.id;
    btn.onclick = async () => {
      const open = sp.hidden;
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "[ đóng lại ↑ ]" : "[ dàn ra tất cả ảnh ]";
      if (open) { sp.hidden = false; paintSpread(fig, sp); }
      else {
        await Promise.all([...sp.children].reverse().map((b, i) => anim(b, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-14px) scale(.8)" }], { duration: 220, delay: i * 25, fill: "forwards" })));
        sp.hidden = true;
      }
    };
  });
  $$(".carousel").forEach(fig => {
    const step = d => { fig._i = (fig._i + d + fig._list.length) % fig._list.length; carShow(fig, d); };
    fig.querySelector(".prev").onclick = e => { e.preventDefault(); e.stopPropagation(); step(-1); };
    fig.querySelector(".next").onclick = e => { e.preventDefault(); e.stopPropagation(); step(1); };
    fig.querySelector("img").onclick = () => openLightbox(fig._list, fig._i, fig._name);
    let x0 = null;   // vuốt ngang để qua ảnh
    fig.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    fig.addEventListener("touchend", e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) step(d < 0 ? 1 : -1); x0 = null; });
  });

  /* ============ BÁT ============ */
  const COLORS = C.bowlColors, colorBy = n => COLORS.find(c => c.name === n);
  const bs = { id: "bat-bong", inner: "sau", topColor: "Hồng", baseColor: "Xanh lá", qty: 1 };
  const bowlOf = id => C.bowls.find(b => b.id === id);
  const bowlForm = $("#bowlForm");

  $("#bowlTabs").innerHTML = C.bowls.map((b, i) => `
    <button type="button" class="btab" role="radio" aria-checked="false" data-id="${b.id}" style="--r:${[-1.5, 1, -.5][i]}deg" aria-label="Chọn bát ${esc(b.short)}, ${k(byId(b.id).price)}">
      <img src="${b.hero}" alt=""><span><span class="t">${esc(b.short.toLowerCase())}</span><span class="mono">[ ${k(byId(b.id).price)} · ${esc(b.height)} ]</span></span>
    </button>`).join("");
  $$(".btab").forEach(b => b.onclick = () => selectBowl(b.dataset.id));

  $("#innerPick").innerHTML = C.bowlInner.map(i => `<label><input type="radio" name="inner" value="${i.id}" ${bs.inner === i.id ? "checked" : ""}><span>Lòng inox · ${esc(i.label)}</span></label>`).join("");
  $$('#innerPick input').forEach(r => r.onchange = () => { bs.inner = r.value; $("#innerNote").textContent = C.bowlInner.find(i => i.id === bs.inner).note; });
  $("#innerNote").textContent = C.bowlInner[0].note;

  // chữ tên màu được tô highlight đúng màu đó; nền sáng thì chữ nâu, nền đậm thì chữ trắng
  const inkOn = hex => {
    const n = parseInt(hex.replace("#", "").replace(/^(.)(.)(.)$/, "$1$1$2$2$3$3"), 16);
    const l = (.299 * (n >> 16 & 255) + .587 * (n >> 8 & 255) + .114 * (n & 255)) / 255;
    return l > .62 ? "#3E2A21" : "#fff";
  };
  $$(".swlist").forEach(box => {
    const part = box.dataset.part;
    box.innerHTML = COLORS.map(c => `<button type="button" class="sw-item" role="radio" aria-checked="false" data-c="${esc(c.name)}" style="--c:${c.hex};--ink:${inkOn(c.hex)}"><span class="sw-hl">${esc(c.name)}</span></button>`).join("");
    box.querySelectorAll(".sw-item").forEach(sw => sw.onclick = () => { bs[part] = sw.dataset.c; paintMix(); });
  });

  function selectBowl(id) {
    const b = bowlOf(id); if (!b) return;
    bs.id = id;
    $$(".btab").forEach(t => t.setAttribute("aria-checked", String(t.dataset.id === id)));
    const p = byId(id);
    loadCarousel($("#bowlCar"), GAL_BOWL[id], p.name);
    $("#bowlName").textContent = `bát ${b.short.toLowerCase()}`;
    // thông tin chi tiết nằm luôn trong note xanh cạnh ảnh
    $("#bowlTags").innerHTML = [
      ["kích thước", b.size], ["cao", b.height], ["hợp với", b.fit], ["nghiêng", "10°"],
      ["chống kiến", "ngăn nước"], ["đế", "đệm silicon"], ["khắc tên", "miễn phí"], ["hoàn thiện", p.lead]
    ].map(([k2, v]) => `<li><span class="k">${esc(k2)}</span><span class="v">${esc(v)}</span></li>`).join("");
    $("#bowlPriceTag").textContent = p.price.toLocaleString("vi-VN") + " đ";
    popNote($(".bowl-stage:not(.ck-stage) .bowl-card"), $("#bowlPriceTag"));
    paintMix(); updateBowlTotal();
  }

  // xem trước phối màu bằng ảnh thật: ghép nửa trên màu A với nửa dưới màu B
  function paintMix() {
    const b = bowlOf(bs.id), t = colorBy(bs.topColor), d = colorBy(bs.baseColor);
    const box = $("#mixPhoto"), top = $("#mixTop"), base = $("#mixBase"), note = $("#mixNote");
    let mode = b.mix, msg = "";
    if (mode === "combo" && (t.slug === "trang" || d.slug === "trang")) { mode = "split"; msg = "Dáng Ngôi Sao chưa có ảnh màu trắng, ảnh đang minh hoạ trên dáng Bông."; }
    if (mode === "none") { mode = "split"; msg = `Ảnh phối màu minh hoạ trên dáng Bông, màu trên ${b.short} tương tự nhé.`; }
    const srcTop = mode === "combo" ? `images/mix/sao/${t.slug}--${d.slug}.jpg` : `images/mix/bong/top-${t.slug}.jpg`;
    const srcBase = mode === "combo" ? srcTop : `images/mix/bong/base-${d.slug}.jpg`;
    box.classList.toggle("is-sao", mode === "combo");
    const topChanged = !top.src.endsWith(srcTop), baseChanged = !base.src.endsWith(srcBase);
    if (topChanged) { top.src = srcTop; anim(top.parentElement, [{ transform: "translateX(-22px) rotate(-1.5deg)", opacity: .3 }, { transform: "rotate(-.6deg)", opacity: 1 }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" }); }
    if (baseChanged) { base.src = srcBase; anim(base.parentElement, [{ transform: "translate(22px,4px) rotate(2deg)", opacity: .3 }, { transform: "translate(4px,3px) rotate(.6deg)", opacity: 1 }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" }); }
    top.alt = `Xem trước ${byId(bs.id).name}: phần trên ${t.name}, phần đế ${d.name}`;
    note.hidden = !msg; note.textContent = msg;
    $$(".swlist").forEach(list => list.querySelectorAll(".sw-item").forEach(sw => sw.setAttribute("aria-checked", String(sw.dataset.c === bs[list.dataset.part]))));
  }
  function updateBowlTotal() {
    const p = byId(bs.id), charm = $("#charm").checked ? C.CHARM_PRICE : 0;
    $("#bowlQty").textContent = bs.qty;
    $("#bowlTotal").textContent = fmt((p.price + charm) * bs.qty);
  }
  $("#petName").addEventListener("input", () => { $("#bowlError").textContent = ""; });
  $("#charm").onchange = updateBowlTotal;
  bowlForm.querySelectorAll("[data-q]").forEach(b => b.onclick = () => { bs.qty = Math.max(1, Math.min(20, bs.qty + +b.dataset.q)); updateBowlTotal(); });
  bowlForm.onsubmit = e => {
    e.preventDefault();
    const petName = bowlForm.petName.value.trim();
    if (!petName) { $("#bowlError").textContent = "Bạn điền tên bé để mình khắc lên bát nhé."; bowlForm.petName.focus(); return; }
    const options = { inner: bs.inner, topColor: bs.topColor, baseColor: bs.baseColor, petName, charm: $("#charm").checked };
    const note = bowlForm.note.value.trim(); if (note) options.note = note;
    addToCart({ productId: bs.id, qty: bs.qty, options, images: [] });
  };
  selectBowl("bat-bong");

  /* ============ COOKIE & KEYCHAIN ============ */
  const cs = { pid: null, design: null, pattern: null, color: null, base: "Kem", qty: 1 };
  let pending = [];
  const rowOf = pid => C.cookieRows.find(r => r.custom === pid || r.ready === pid);

  $("#priceRows").innerHTML = C.cookieRows.map(r => {
    const cell = (id, cls) => id ? `<button type="button" class="pbtn ${cls}" data-pid="${id}" aria-pressed="false" aria-label="${esc(byId(id).name)}, ${k(byId(id).price)}">${k(byId(id).price)}</button>` : `<span class="pna" aria-label="không có">–</span>`;
    return `<tr><td>${esc(r.label)}${r.sub ? ` <i>${esc(r.sub)}</i>` : ""}</td><td class="pc">${cell(r.custom, "c")}</td><td class="pc">${cell(r.ready, "")}</td></tr>`;
  }).join("") + `<tr><td>Noel Charm 2026<br><i>đặt trên trang thiết kế riêng</i></td><td class="pc"><a class="pbtn c" href="#noel" style="display:inline-flex;align-items:center;text-decoration:none">129K</a></td><td class="pc"><span class="pna">–</span></td></tr>`;
  // con trỏ hướng dẫn chỉ vào ô giá đầu tiên, cho tới khi khách chọn món
  const pWrap = $("#ptableWrap"), pGuide = $("#priceGuide");
  const placeGuide = () => {
    const b = $(".pbtn[data-pid]", pWrap); if (!b || !b.offsetWidth) return;
    const w = pWrap.getBoundingClientRect(), r = b.getBoundingClientRect();
    pGuide.style.left = (r.left - w.left + r.width * .55) + "px";
    pGuide.style.top = (r.top - w.top + r.height * .5) + "px";
  };
  if ("ResizeObserver" in window) new ResizeObserver(placeGuide).observe(pWrap);
  placeGuide();
  $$(".pbtn[data-pid]").forEach(b => b.onclick = () => {
    choosePrice(b.dataset.pid);
    // điện thoại: các bước nằm dưới bảng giá, cuộn xuống bước tiếp theo để khách thấy ngay
    const next = $$("#cookieForm > .box").find(x => !x.hidden);
    if (next && next.getBoundingClientRect().top > b.getBoundingClientRect().bottom + 80) next.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });

  function choosePrice(pid) {
    const p = byId(pid), row = rowOf(pid); if (!p || !row) return;
    cs.pid = pid;
    $("#ptableWrap").classList.add("chosen");
    $$(".pbtn[data-pid]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.pid === pid)));
    $("#readyStep").hidden = p.type !== "ready";
    $("#creamStep").hidden = !row.cream;
    $("#customFields").hidden = p.type !== "custom";
    $("#cookieEmpty").hidden = true;
    $("#cookieOrder").hidden = false;
    // đánh số khung theo các bước đang hiện
    let n = 2;
    [["#readyStep", "chọn bé"], ["#creamStep", "nền kem"], ["#cookieOrder", p.type === "custom" ? "ảnh bé & đặt hàng" : "đặt hàng"]].forEach(([sel, t]) => {
      if (!$(sel).hidden) $(sel + " .box-h").textContent = `[ ${n++} ] ${t}`;
    });
    const gk = pid === "moc-khoa-resin" ? "key" : "cookie", car = $("#cookieCar");
    if (car.dataset.key !== gk) loadCarousel(car, gk, gk === "key" ? "Keychain thủ công" : "Cookie");
    paintCookieNote(pid);
    $("#cookieError").textContent = "";
    renderCookieSum();
  }

  // 13 mẫu (ảnh tách nền): một lưới + một danh sách giống, đổi giữa bé cún / bé mèo
  const dogs = C.cookieDesigns.filter(d => d.kind === "cún"), cats = C.cookieDesigns.filter(d => d.kind === "mèo");
  let kind = "cún";
  function paintDesigns() {
    const list = kind === "cún" ? dogs : cats;
    $("#cookieGrid").innerHTML = list.map((d, i) => `<button type="button" class="ck" role="radio" aria-checked="${cs.design === d.id}" data-id="${d.id}" aria-label="Chọn bé ${esc(d.kind)} ${i + 1}, ${esc(d.name)}">
      <span class="n">[${i + 1}]</span><img src="images/cookie/${d.id}.webp" alt="" loading="lazy">${HEART}</button>`).join("");
    $("#breedList").innerHTML = list.map((d, i) => `<li><button type="button" data-id="${d.id}" aria-pressed="${cs.design === d.id}">${i + 1}. ${esc(d.name)}</button></li>`).join("");
    $("#listTitle").textContent = `bé ${kind}`;
    $$("#cookieGrid .ck, #breedList button").forEach(b => b.onclick = () => {
      cs.design = cs.design === b.dataset.id ? null : b.dataset.id;
      $("#cookieError").textContent = "";
      paintDesigns(); renderCookieSum();
    });
  }
  $$(".pick-tabs button").forEach(b => b.onclick = () => {
    kind = b.dataset.kind;
    $$(".pick-tabs button").forEach(x => x.setAttribute("aria-selected", String(x === b)));
    paintDesigns();
  });
  paintDesigns();
  const designLabel = () => {
    const d = C.cookieDesigns.find(x => x.id === cs.design); if (!d) return "";
    const list = d.kind === "cún" ? dogs : cats;
    return `bé ${d.kind} ${list.indexOf(d) + 1} · ${d.name}`;
  };

  // nền kem: hoạ tiết vẽ bằng SVG, tô theo màu kem đang chọn
  function patSVG(i, fill) {
    const ink = `color-mix(in srgb, ${fill} 55%, #6f8797)`;
    const shapes = [
      // sao
      [[30, 30], [70, 22], [52, 56], [24, 74], [78, 70], [46, 92], [86, 44]].map(([x, y], j) => `<path d="M${x} ${y - 6}l1.8 4 4.4.5-3.3 3 .9 4.4-3.8-2.2-3.8 2.2.9-4.4-3.3-3 4.4-.5z" fill="${ink}" transform="rotate(${j * 17} ${x} ${y})"/>`).join(""),
      // sọc
      [14, 26, 38, 50, 62, 74, 86].map(x => `<path d="M${x} 0 C${x + 3} 30 ${x - 3} 70 ${x + 2} 120" stroke="${ink}" stroke-width="3.4" fill="none"/>`).join(""),
      // tim
      [[28, 28], [66, 24], [48, 52], [22, 70], [76, 62], [50, 88], [86, 92]].map(([x, y]) => `<path d="M${x} ${y + 6}c-6-4-8-7-8-10 0-3 4-5 8-1 4-4 8-2 8 1 0 3-2 6-8 10z" fill="${ink}"/>`).join(""),
      // chấm bi
      [20, 40, 60, 80].flatMap(x => [18, 40, 62, 84, 106].map(y => `<circle cx="${x + (y % 44 ? 0 : 10)}" cy="${y}" r="3" fill="${ink}"/>`)).join(""),
      // gợn sóng
      [24, 48, 72, 96].map(y => `<path d="M0 ${y} q8 -10 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" stroke="${ink}" stroke-width="3" fill="none"/>`).join(""),
      // tam giác
      `<path d="M-10 120 L30 0 L70 120 Z M30 120 L70 0 L110 120 Z M-10 60 H110 M-10 30 H110 M-10 90 H110" stroke="${ink}" stroke-width="2.4" fill="none"/>`
    ];
    return `<svg viewBox="0 0 100 120" aria-hidden="true"><defs><clipPath id="ov${i}"><ellipse cx="50" cy="60" rx="46" ry="56"/></clipPath></defs>
      <ellipse cx="50" cy="60" rx="46" ry="56" fill="${fill}"/><g clip-path="url(#ov${i})">${shapes[i]}</g>
      <ellipse cx="50" cy="60" rx="46" ry="56" fill="none" stroke="#fff" stroke-width="4"/></svg>`;
  }
  function paintPatterns() {
    const fill = (C.creamColors.find(c => c.name === cs.color) || { hex: "#eef5fb" }).hex;
    $("#patterns").innerHTML = C.creamPatterns.map((n, i) => `<button type="button" class="pat" role="radio" aria-checked="${cs.pattern === n}" data-n="${esc(n)}" aria-label="Hoạ tiết ${esc(n)}"><span class="n">[${i + 1}]</span>${patSVG(i, fill)}</button>`).join("");
    $$(".pat").forEach(b => b.onclick = () => { cs.pattern = b.dataset.n; paintPatterns(); renderCookieSum(); });
  }
  $("#cbars").innerHTML = C.creamColors.map(c => `<button type="button" class="cbar" role="radio" aria-checked="false" data-n="${esc(c.name)}" style="--c:${c.hex}" aria-label="Màu kem ${esc(c.name)}" title="${esc(c.name)}"></button>`).join("");
  $$(".cbar").forEach(b => b.onclick = () => { cs.color = b.dataset.n; $("#creamName").textContent = cs.color; $$(".cbar").forEach(x => x.setAttribute("aria-checked", String(x === b))); paintPatterns(); renderCookieSum(); });
  $("#bases").innerHTML = C.cookieBases.map(c => `<button type="button" class="base-btn" role="radio" aria-checked="${cs.base === c.name}" data-n="${esc(c.name)}" style="--c:${c.hex}" aria-label="Đế bánh ${esc(c.name)}"><span></span><span class="mono">${esc(c.name)}</span></button>`).join("");
  $$(".base-btn").forEach(b => b.onclick = () => { cs.base = b.dataset.n; $$(".base-btn").forEach(x => x.setAttribute("aria-checked", String(x === b))); renderCookieSum(); });
  paintPatterns();
  const creamLabel = () => `nền ${cs.pattern || "?"} · kem ${cs.color || "?"} · đế ${cs.base}`;

  function renderCookieSum() {
    const p = cs.pid && byId(cs.pid), row = p && rowOf(p.id), el = $("#cookieSum");
    if (!p) el.innerHTML = "Bạn chưa chọn món nè.";
    else {
      const parts = [`<b>${esc(p.name)}</b>`];
      if (p.type === "ready") parts.push(cs.design ? esc(designLabel()) : `<span style="color:var(--red)">chọn một bé trong danh sách nhé</span>`);
      else parts.push("mình vẽ theo ảnh bé bạn gửi");
      if (row.cream) parts.push(esc(creamLabel()));
      el.innerHTML = parts.join(" · ");
    }
    $("#cookieQty").textContent = cs.qty;
    $("#cookieTotal").textContent = fmt(p ? p.price * cs.qty : 0);
  }
  const cookieForm = $("#cookieForm");
  cookieForm.querySelectorAll("[data-q]").forEach(b => b.onclick = () => { cs.qty = Math.max(1, Math.min(20, cs.qty + +b.dataset.q)); renderCookieSum(); });

  const fileInput = $("#fileInput");
  function drawPreviews() {
    const box = $("#previews");
    box.innerHTML = pending.map((src, i) => `<div><img src="${src}" alt="Ảnh bé ${i + 1}"><button type="button" data-rm="${i}" aria-label="Xoá ảnh ${i + 1}">×</button></div>`).join("");
    box.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { pending.splice(+b.dataset.rm, 1); drawPreviews(); });
    $("#uploader").textContent = pending.length >= 3 ? "Đủ 3 ảnh rồi nè" : `+ chọn ảnh bé (${pending.length}/3)`;
  }
  $("#uploader").onclick = () => { if (pending.length < 3) fileInput.click(); };
  fileInput.onchange = async () => {
    for (const f of [...fileInput.files]) {
      if (pending.length >= 3) break;
      try { pending.push(await shrink(f)); } catch (e) { toast("Không đọc được ảnh này, bạn thử ảnh khác nhen"); }
    }
    fileInput.value = ""; drawPreviews();
  };
  cookieForm.onsubmit = e => {
    e.preventDefault();
    const err = $("#cookieError"), p = cs.pid && byId(cs.pid);
    err.textContent = "";
    if (!p) { err.textContent = "Bạn bấm chọn một giá trong bảng giúp mình nhé."; return; }
    const row = rowOf(p.id), options = {}, note = cookieForm.note.value.trim(), design = [];
    if (p.type === "ready") {
      if (!cs.design) { err.textContent = "Bạn chọn một bé trong danh sách bé cún / bé mèo nhé."; $("#readyStep").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); return; }
      design.push(designLabel());
    } else {
      const petName = cookieForm.petName.value.trim(), sp = cookieForm.querySelector('input[name="species"]:checked');
      if (!pending.length) { err.textContent = "Bạn tải 1–3 ảnh bé lên giúp mình nhé."; return; }
      if (!petName || !sp) { err.textContent = "Bạn điền tên bé và chọn bé là mèo hay cún nhé."; return; }
      options.petName = petName; options.species = sp.value;
      const breed = cookieForm.breed.value.trim(); if (breed) options.breed = breed;
    }
    if (row.cream) {
      if (!cs.pattern || !cs.color) { err.textContent = "Bạn chọn hoạ tiết và màu kem nền nhé."; $("#creamStep").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); return; }
      design.push(creamLabel());
    }
    if (design.length) options.design = design.join(" · ");
    if (note) options.note = note;
    addToCart({ productId: p.id, qty: cs.qty, options, images: pending.slice() });
    pending = []; drawPreviews(); cookieForm.reset(); cs.qty = 1; renderCookieSum();
  };
  drawPreviews(); renderCookieSum();

  /* ============ NOEL ============ */
  $("#noelLink").href = C.contact.noelDesigner;
  renderGallery($("#noelGallery"), "noel", "Noel Charm 2026");
  loadCarousel($("#cookieCar"), "cookie", "Cookie");
  paintCookieNote(null);
  watchReveal();
  // dự phòng: nếu trình duyệt báo trễ, phần đang nằm trong màn hình vẫn hiện ra
  const revealVisible = () => $$(".reveal:not(.in)").forEach(el => { const r = el.getBoundingClientRect(); if (r.width && r.top < innerHeight && r.bottom > 0) el.classList.add("in"); });
  setTimeout(revealVisible, 1500);
  window.addEventListener("scroll", () => { clearTimeout(window._rv); window._rv = setTimeout(revealVisible, 400); }, { passive: true });
  const ST = ["", "", "dark", "blue", ""], SR = [-4, -6, 5, 3, -3];
  $("#stampTree").innerHTML = C.noelTree.map((src, i) => `<span class="stamp ${ST[i]}" style="--r:${SR[i]}deg"><img src="${src}" alt="" loading="lazy"></span>`).join("");
  const noelSeen = () => setTimeout(() => $("#noel").classList.add("seen"), 60);
  $("#contactLinks").innerHTML = [
    ["[ INSTAGRAM ]", C.contact.instagram], ["[ FACEBOOK ]", C.contact.facebook],
    ["[ TIKTOK ]", C.contact.tiktok], ["[ ZALO " + C.contact.zaloNumber + " ]", C.contact.zalo]
  ].map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`).join("");

  /* resize ảnh trên máy khách cho nhẹ (≤1600px, JPEG) */
  function shrink(file, maxSide = 1600, q = 0.85) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, maxSide / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", q));
      };
      img.onerror = rej; img.src = url;
    });
  }

  /* ============ GIỎ HÀNG ============ */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("ip_cart") || "[]"); } catch (e) { cart = []; }
  function saveCart() {
    try { localStorage.setItem("ip_cart", JSON.stringify(cart)); }
    catch (e) { /* ảnh quá nặng cho localStorage: giữ trong bộ nhớ */ }
    renderCart();
  }
  function addToCart(item) {
    cart.push({ uid: Date.now() + "" + Math.random().toString(36).slice(2, 6), ...item });
    flyToCart(thumbOf(item));
    saveCart();
    const cb = $("#cartBtn"); cb.classList.add("bump"); setTimeout(() => cb.classList.remove("bump"), 400);
    toast("Đã thêm vào giỏ rồi nè");
  }
  function linePrice(it) { const p = byId(it.productId); return (p.price + (it.options.charm ? C.CHARM_PRICE : 0)) * it.qty; }
  function totals() {
    const sub = cart.reduce((s, it) => s + (byId(it.productId) ? linePrice(it) : 0), 0);
    const ship = sub === 0 || sub >= C.FREESHIP_FROM ? 0 : C.SHIP_FEE;
    return { sub, ship, total: sub + ship };
  }
  function describe(it) {
    const o = it.options, out = [];
    if (o.inner) out.push(C.bowlInner.find(i => i.id === o.inner)?.label);
    if (o.topColor) out.push(`Trên ${o.topColor} / Đế ${o.baseColor}`);
    if (o.petName) out.push(`Tên: ${o.petName}`);
    if (o.species) out.push(o.species + (o.breed ? ` · ${o.breed}` : ""));
    if (o.design) out.push(o.design);
    if (o.charm) out.push("+ Charm");
    if (it.images?.length) out.push(`${it.images.length} ảnh`);
    return out.filter(Boolean).map(esc).join(" · ");
  }
  function thumbOf(it) {
    const p = byId(it.productId), o = it.options;
    if (it.images?.length) return it.images[0];
    if (o.topColor) { const t = colorBy(o.topColor), d = colorBy(o.baseColor); if (t && d && it.productId === "bat-sao" && t.slug !== "trang" && d.slug !== "trang") return `images/mix/sao/${t.slug}--${d.slug}.jpg`; if (t) return `images/mix/bong/top-${t.slug}.jpg`; }
    const m = /bé (cún|mèo) (\d+)/.exec(o.design || "");
    if (m) return `images/cookie/${m[1] === "cún" ? "cun" : "meo"}-${m[2]}.webp`;
    return p.images[0];
  }
  function renderCart() {
    cart = cart.filter(it => byId(it.productId));
    $("#cartCount").textContent = cart.reduce((s, it) => s + it.qty, 0);
    const box = $("#cartItems"), foot = $("#cartFoot");
    if (!cart.length) { box.innerHTML = `<p class="empty">Giỏ đang trống nè.<br>Chọn cho bé cưng một món nhen.</p>`; foot.innerHTML = ""; return; }
    box.innerHTML = cart.map(it => {
      const p = byId(it.productId);
      return `<div class="ci"><img src="${thumbOf(it)}" alt="">
        <div><h4>${esc(p.name)} × ${it.qty}</h4><p>${describe(it)}</p><button class="rm" data-uid="${it.uid}" aria-label="Xoá ${esc(p.name)} khỏi giỏ">Xoá</button></div>
        <b>${k(linePrice(it))}</b></div>`;
    }).join("");
    box.querySelectorAll(".rm").forEach(b => b.onclick = () => { cart = cart.filter(x => x.uid !== b.dataset.uid); saveCart(); });
    const t = totals(), left = C.FREESHIP_FROM - t.sub;
    foot.innerHTML = `
      <div class="line"><span>Tạm tính</span><span>${fmt(t.sub)}</span></div>
      <div class="line"><span>Phí ship</span><span>${t.ship ? fmt(t.ship) : "Miễn phí"}</span></div>
      <div class="line total"><span>Tổng</span><span>${fmt(t.total)}</span></div>
      <p class="ship-note">${left > 0 ? `Thêm ${k(left)} nữa là được freeship nhen` : "Đơn của bạn được freeship nhé"}</p>
      <button class="btn btn-block" id="toCheckout">Đặt hàng</button>`;
    $("#toCheckout").onclick = openCheckout;
  }
  const drawer = $("#cartDrawer"), overlay = $("#overlay");
  const openCart = () => { drawer.classList.add("open"); overlay.classList.add("show"); drawer.setAttribute("aria-hidden", "false"); drawer.inert = false; $("#cartClose").focus(); };
  const closeCart = () => { drawer.classList.remove("open"); overlay.classList.remove("show"); drawer.setAttribute("aria-hidden", "true"); drawer.inert = true; };
  $("#cartBtn").onclick = openCart; $("#cartClose").onclick = closeCart; overlay.onclick = closeCart;
  document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) { closeCart(); $("#cartBtn").focus(); } });

  /* ============ ĐẶT HÀNG ============
     Server trả checkoutUrl (chế độ payOS) thì chuyển sang trang QR;
     không có checkoutUrl (chế độ nhắn tin) thì về trang kết quả báo đặt thành công. */
  const cdlg = $("#checkoutDialog"), cform = $("#checkoutForm");
  function openCheckout() {
    closeCart();
    const t = totals();
    $("#checkoutSummary").innerHTML = cart.map(it => `<div class="line"><span>${esc(byId(it.productId).name)} × ${it.qty}</span><span>${k(linePrice(it))}</span></div>`).join("") +
      `<div class="line"><span>Phí ship</span><span>${t.ship ? fmt(t.ship) : "Miễn phí"}</span></div>
       <div class="line total"><span>Tổng cộng</span><span>${fmt(t.total)}</span></div>`;
    $("#checkoutError").textContent = "";
    try { const saved = JSON.parse(localStorage.getItem("ip_customer") || "{}"); for (const key in saved) if (cform[key] && !cform[key].value) cform[key].value = saved[key]; } catch (e) {}
    cdlg.showModal();
  }
  cform.onsubmit = async e => {
    e.preventDefault();
    const err = $("#checkoutError"), btn = $("#payBtn");
    err.textContent = "";
    if (!cform.checkValidity()) { err.textContent = "Bạn điền đủ các mục có dấu * và kiểm tra lại số điện thoại giúp mình nhen."; return; }
    if (!C.API_URL || C.API_URL.startsWith("DAN_")) { err.textContent = "Web chưa được nối với hệ thống đơn hàng (thiếu API_URL trong config.js)."; return; }
    const customer = Object.fromEntries(["name", "phone", "social", "email", "address", "note"].map(f => [f, cform[f].value.trim()]));
    try { localStorage.setItem("ip_customer", JSON.stringify({ name: customer.name, phone: customer.phone, social: customer.social, email: customer.email, address: customer.address })); } catch (e) {}
    const base = location.href.replace(/[#?].*$/, "").replace(/index\.html$/, "");
    btn.disabled = true; btn.textContent = "Đang gửi đơn…";
    try {
      const res = await fetch(C.API_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "createOrder", hp: cform.website.value, customer,
          items: cart.map(it => ({ productId: it.productId, qty: it.qty, options: it.options, images: it.images || [] })),
          returnUrl: base + "ket-qua.html", cancelUrl: base + "ket-qua.html"
        })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Lỗi không xác định");
      try { localStorage.setItem("ip_last_order", String(data.orderCode)); } catch (e) {}
      location.href = data.checkoutUrl || (base + "ket-qua.html?orderCode=" + encodeURIComponent(data.orderCode) + "&chat=1");
    } catch (ex) {
      err.innerHTML = `Chưa gửi được đơn: ${esc(ex.message)}.<br>Bạn thử lại, hoặc nhắn mình qua <a href="${C.contact.zalo}" target="_blank" rel="noopener">Zalo</a> / <a href="${C.contact.instagram}" target="_blank" rel="noopener">IG</a> nhen.`;
      btn.disabled = false; btn.textContent = "Đặt hàng";
    }
  };

  let tt;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2200); }

  /* ============ con trỏ hướng dẫn ============ */
  // máy tính có chuột: rê vào chỗ bấm được thì hiện chữ đi kèm con trỏ
  const CURSOR = [
    ["#folder", () => folderOpen ? "cất vào folder" : "mở folder"], [".cluster", "mở xấp ảnh"], [".flip-hit", "lật ảnh"], [".back", "lật lại"],
    [".ov-card", "xem & đặt"], [".pbtn", "chọn món này"], [".ck", "chọn bé này"], ["#breedList button", "chọn bé này"],
    [".btab", "đổi dáng bát"], [".sw-item", "chọn màu"], [".pat", "chọn hoạ tiết"], [".cbar", "chọn màu kem"], [".base-btn", "chọn đế bánh"],
    ["#btnMess", "xáo tung"], [".g-thumb", "xem ảnh lớn"], [".car-nav", "ảnh khác"], [".carousel img", "xem ảnh lớn"], ["#ovToggle", () => ovBody.hidden ? "mở danh sách" : "thu gọn"], ["#tabs [role=tab]", "mở tab"], [".uploader", "tải ảnh bé"]
  ];
  const hint = $("#cursorHint");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => { x += (tx - x) * (reduced ? 1 : .28); y += (ty - y) * (reduced ? 1 : .28); hint.style.transform = `translate(${x}px, ${y}px)`; raf = Math.abs(tx - x) + Math.abs(ty - y) > .5 ? requestAnimationFrame(loop) : 0; };
    document.addEventListener("pointermove", e => {
      tx = e.clientX; ty = e.clientY;
      const hit = CURSOR.find(([sel]) => e.target.closest(sel));
      const on = hit && !(hit[0] === ".cluster" && !folderOpen);
      hint.classList.toggle("show", !!on);
      if (on) hint.querySelector(".txt").textContent = typeof hit[1] === "function" ? hit[1]() : hit[1];
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener("pointerleave", () => hint.classList.remove("show"));
  }

  renderCart();
  if (location.hash) goTo(location.hash);
})();
