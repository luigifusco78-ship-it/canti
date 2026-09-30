const KEY="canti-library-v1";
let songs=[];
try{songs=JSON.parse(localStorage.getItem(KEY)||"[]");if(!Array.isArray(songs))songs=[]}catch(e){songs=[]}
let current=null,fontSize=18,transpose=0;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function persist(){try{localStorage.setItem(KEY,JSON.stringify(songs))}catch(e){alert("Memoria del dispositivo piena: non è stato possibile salvare.")}render()}
function render(){
 const q=$("search").value.toLowerCase().trim();
 const matches=songs.map((s,i)=>({...s,index:i})).filter(s=>s.title.toLowerCase().includes(q));
 $("empty").classList.toggle("hidden",matches.length>0);
 $("list").innerHTML=matches.map(s=>`<article class="song"><div class="songMain" data-open="${s.index}"><div class="songTitle">${esc(s.title)}</div><div class="songMeta">${esc(s.type||"Canto")}</div></div><button class="delete" data-delete="${s.index}" aria-label="Elimina ${esc(s.title)}">🗑</button></article>`).join("");
 document.querySelectorAll("[data-open]").forEach(el=>el.addEventListener("click",()=>openSong(Number(el.dataset.open))));
 document.querySelectorAll("[data-delete]").forEach(el=>el.addEventListener("click",()=>removeSong(Number(el.dataset.delete))));
}
function openSong(i){current=songs[i];fontSize=18;transpose=0;$("list").classList.add("hidden");$("empty").classList.add("hidden");$("viewer").classList.remove("hidden");$("songTitle").textContent=current.title;$("transposeLabel").textContent="0";showText()}
function showText(){if(!current)return;let t=current.text;if(transpose)t=transposeChords(t,transpose);$("songText").textContent=t;$("songText").style.fontSize=fontSize+"px"}
function transposeChords(text,n){
 const notes=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
 const enh={"Db":"C#","Eb":"D#","Gb":"F#","Ab":"G#","Bb":"A#"};
 return text.replace(/\b([A-G](?:#|b)?)(m|maj7|maj|min7|m7|7|sus4|sus2|dim|aug|add9)?\b/g,(m,note,suf="")=>{
  const normalized=enh[note]||note;const idx=notes.indexOf(normalized);if(idx<0)return m;
  return notes[(idx+n%12+12)%12]+suf;
 });
}
function removeSong(i){if(confirm("Eliminare questo canto?")){songs.splice(i,1);persist()}}
$("search").addEventListener("input",render);
$("importBtn").addEventListener("click",()=>$("fileInput").click());
$("fileInput").addEventListener("change",async e=>{
 for(const f of e.target.files){
  if(f.name.toLowerCase().endsWith(".pdf")){alert("Il PDF non viene ancora archiviato in questa versione. Per ora importa file CRD o TXT.");continue}
  const text=await f.text();
  songs.push({title:f.name.replace(/\.(crd|txt)$/i,""),text,type:f.name.toLowerCase().endsWith(".crd")?"CRD":"TXT"});
 }
 persist();e.target.value="";
});
$("addBtn").addEventListener("click",()=>$("addDialog").showModal());
$("cancelAdd").addEventListener("click",()=>$("addDialog").close());
$("addForm").addEventListener("submit",e=>{
 e.preventDefault();const title=$("titleInput").value.trim(),text=$("textInput").value;
 if(!title||!text)return;songs.push({title,text,type:"Canto"});
 $("addDialog").close();$("titleInput").value="";$("textInput").value="";persist();
});
$("backBtn").addEventListener("click",()=>{$("viewer").classList.add("hidden");$("list").classList.remove("hidden");render()});
$("fontDown").addEventListener("click",()=>{fontSize=Math.max(12,fontSize-1);showText()});
$("fontUp").addEventListener("click",()=>{fontSize=Math.min(34,fontSize+1);showText()});
$("transposeDown").addEventListener("click",()=>{transpose--; $("transposeLabel").textContent=transpose;showText()});
$("transposeUp").addEventListener("click",()=>{transpose++; $("transposeLabel").textContent=transpose;showText()});
render();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
