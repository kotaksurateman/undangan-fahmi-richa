(()=> {
const cfg=window.WEDDING_CONFIG||{}, $=id=>document.getElementById(id);
const wa=(text)=>`https://wa.me/${(cfg.whatsappNumber||"6281214508218").replace(/\D/g,"")}?text=${encodeURIComponent(text)}`;
$("whatsappConfirm").addEventListener("click",()=>window.open(wa(`Assalamu'alaikum, saya ingin mengonfirmasi kehadiran untuk pernikahan ${cfg.couple} pada 15 November 2026.\nNama:\nKehadiran:\nJumlah tamu (maks. 2):`),"_blank","noopener"));
$("whatsappWish").addEventListener("click",()=>window.open(wa(`Assalamu'alaikum ${cfg.couple},\n\nSelamat menempuh hidup baru. Doa dan ucapan saya:\n\nNama:`),"_blank","noopener"));
document.querySelectorAll(".copy-account").forEach(button=>button.addEventListener("click",async()=>{const number=button.dataset.account;const status=$("copyStatus");try{await navigator.clipboard.writeText(number);status.textContent="Nomor rekening berhasil disalin: "+number;}catch(err){status.textContent="Nomor rekening: "+number+" (silakan salin secara manual).";}}));
const music=$("bgMusic"),musicBtn=$("musicToggle"); musicBtn.addEventListener("click",async()=>{try{if(music.paused){await music.play();musicBtn.innerHTML="♫ <span>JEDA MUSIK</span>"}else{music.pause();musicBtn.innerHTML="♫ <span>PUTAR MUSIK</span>"}}catch(e){alert("Tambahkan file musik ke folder assets/music.mp3 terlebih dahulu.")}});
const target=new Date(cfg.eventDate||"2026-11-15T00:00:00+07:00").getTime();
function tick(){let d=Math.max(0,target-Date.now());$("days").textContent=Math.floor(d/86400000);$("hours").textContent=String(Math.floor(d%86400000/3600000)).padStart(2,"0");$("minutes").textContent=String(Math.floor(d%3600000/60000)).padStart(2,"0");$("seconds").textContent=String(Math.floor(d%60000/1000)).padStart(2,"0")}
tick();setInterval(tick,1000);
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
window.addEventListener("scroll",()=>{const hero=document.querySelector(".hero");if(hero){hero.style.setProperty("--parallax",`${window.scrollY*.12}px`)}},{passive:true});

async function loadWishes(){
  const list=$("wishesList"), status=$("wishesStatus");
  if(!cfg.appsScriptUrl){list.innerHTML='<p class="wish-empty">Ucapan akan tampil di sini setelah koneksi Google Apps Script diaktifkan.</p>';status.textContent="";return;}
  try{
    const url=new URL(cfg.appsScriptUrl);
    url.searchParams.set("action","wishes");
    const response=await fetch(url.toString(),{method:"GET",cache:"no-store"});
    if(!response.ok) throw new Error("Permintaan daftar ucapan gagal");
    const result=await response.json();
    if(!result.ok) throw new Error(result.message||"Daftar ucapan belum tersedia");
    list.replaceChildren();
    const wishes=(result.wishes||[]).filter(item=>String(item.ucapan||"").trim()).slice(0,12);
    if(!wishes.length){list.innerHTML='<p class="wish-empty">Belum ada ucapan. Jadilah yang pertama mengirimkan doa untuk kami.</p>';status.textContent="";return;}
    wishes.forEach(item=>{
      const card=document.createElement("article");card.className="wish-card";
      const name=document.createElement("h3");name.className="wish-name";name.textContent=item.nama||"Tamu undangan";
      const message=document.createElement("p");message.className="wish-message";message.textContent=item.ucapan;
      card.append(name,message);list.append(card);
    });
    status.textContent="Menampilkan hingga 12 ucapan terbaru.";
  }catch(error){list.innerHTML='<p class="wish-empty">Ucapan belum dapat dimuat. Silakan coba lagi nanti.</p>';status.textContent="Periksa URL dan deployment Google Apps Script.";}
}
loadWishes();

const rsvpForm = $("rsvpForm");
rsvpForm.addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.currentTarget; // Simpan referensi sebelum await.
  const status = $("formStatus");
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.jumlah = Number(data.jumlah);

  if (data.jumlah > Number(cfg.maxGuestsPerSubmission || 2)) {
    status.textContent = "Maksimal 2 orang per pendaftaran.";
    return;
  }
  if (!cfg.appsScriptUrl) {
    status.textContent = "RSVP online belum aktif. Gunakan konfirmasi via WhatsApp atau selesaikan pemasangan Apps Script.";
    return;
  }

  status.textContent = "Mengirim konfirmasi…";
  try {
    const resp = await fetch(cfg.appsScriptUrl, {
      method: "POST",
      headers: {"Content-Type": "text/plain;charset=utf-8"},
      body: JSON.stringify(data)
    });
    const result = await resp.json();
    if (!resp.ok || !result.ok) throw new Error(result.message || "Gagal menyimpan RSVP");
    status.textContent = result.message || "RSVP berhasil disimpan. Terima kasih!";
    form.reset();
  } catch (err) {
    status.textContent = "RSVP belum dapat dipastikan tersimpan. Periksa tab RSVP di spreadsheet sebelum mencoba lagi untuk menghindari data ganda. Detail: " + err.message;
  }
});
})();