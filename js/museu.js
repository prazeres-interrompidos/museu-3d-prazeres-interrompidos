import * as THREE from "three";

/* Museu Virtual dos Livros — Prazeres Interrompidos
   Versão 2: navegação com setas, portas/collisions, átrio aberto,
   fachada de entrada e tratamento visual fotorealista baseado nas imagens do projeto. */

const REPO = "https://api.github.com/repos/prazeres-interrompidos/museu-prazeres-interrompidos";
const EP_FOLDER = "EPISÓDIOS PARA O MUSEU";
const EPISODE_COUNT = 100;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9eb9d1);
scene.fog = new THREE.Fog(0x9eb9d1, 42, 120);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.05, 180);
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:"high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const museum = new THREE.Group();
scene.add(museum);

const texLoader = new THREE.TextureLoader();
const textureCache = new Map();
function texture(path){
  if(textureCache.has(path)) return textureCache.get(path);
  const t = texLoader.load(path);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  textureCache.set(path,t);
  return t;
}

function mat(color, rough=.75, metal=.02){
  return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
}
function textured(path, rough=.72){
  return new THREE.MeshStandardMaterial({map:texture(path),roughness:rough,metalness:.02});
}
function box(w,h,d,x,y,z,m,group=museum){
  const o = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; group.add(o); return o;
}
function plane(w,h,x,y,z,m,ry=0,group=museum){
  const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m); o.position.set(x,y,z); o.rotation.y=ry; o.castShadow=false; o.receiveShadow=true; group.add(o); return o;
}
function cylinder(r,h,x,y,z,m,group=museum){
  const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),m); o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; group.add(o); return o;
}

function label(text,x,y,z,ry=0,size=.9){
  const c=document.createElement("canvas"),ctx=c.getContext("2d");
  c.width=1200;c.height=260;
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle="rgba(20,16,12,.88)";ctx.fillRect(30,25,1140,210);
  ctx.strokeStyle="rgba(224,195,145,.7)";ctx.lineWidth=4;ctx.strokeRect(30,25,1140,210);
  ctx.fillStyle="#f6f0e5";ctx.font="bold 64px Georgia";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText(text,600,130);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const s=new THREE.Mesh(new THREE.PlaneGeometry(7.2*size,1.56*size),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthTest:true}));
  s.position.set(x,y,z);s.rotation.y=ry;s.userData.fixedLabel=true;museum.add(s);return s;
}

// ---------- Lighting ----------
scene.add(new THREE.HemisphereLight(0xddeeff,0x33281f,1.15));
scene.add(new THREE.AmbientLight(0xffffff,0.18));
const sun=new THREE.DirectionalLight(0xfff1d2,2.35);sun.position.set(-20,35,28);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
const warm=new THREE.PointLight(0xffd09a,1.4,34);warm.position.set(0,7,0);scene.add(warm);

// ---------- Photorealistic entrance ----------
const facadeGroup=new THREE.Group();facadeGroup.position.z=16.6;museum.add(facadeGroup);
const facadeLeft=texture("assets/facade_left.png");
const facadeTop=texture("assets/facade_top.png");
const facadeRight=texture("assets/facade_right.png");
const facadeMat=(t)=>new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide});
// Backdrop is deliberately split so the central doorway remains physically open.
plane(18,9.2,-11,6.0,0,facadeMat(facadeLeft),0,facadeGroup);
plane(8.5,2.2,0,9.6,0,facadeMat(facadeTop),0,facadeGroup);
plane(18,9.2,11,6.0,0,facadeMat(facadeRight),0,facadeGroup);

// Entrance forecourt, stairs and monumental door.
box(34,.35,16,0,-.18,15.8,mat(0xbab1a2));
for(let i=0;i<7;i++) box(18-i*1.4,.28,1.0,0,i*.20,14.0+i*0.55,mat(0xe3d9ca));
box(8.2,7,.32,-4.5,4,16.15,mat(0x2d2520));
box(8.2,7,.32,4.5,4,16.15,mat(0x2d2520));
label("MUSEU VIRTUAL DOS LIVROS",0,8.1,16.0,0,.75);
label("PRAZERES INTERROMPIDOS",0,6.7,15.98,0,.52);

// ---------- Atrium: open to the sky ----------
const stone=mat(0xd9d0c2,.66);
const marble=mat(0xe9e2d5,.48);
const dark=mat(0x302820,.72);
const wood=mat(0x4b3324,.68);
const gold=mat(0xb58a4f,.35,.18);

box(28,.25,28,0,-.13,0,marble);
// Low parapets define the atrium without creating a ceiling.
box(28,3,.35,0,1.5,-14,dark);
box(28,3,.35,0,1.5,14,dark);
box(.35,3,28,-14,1.5,0,dark);
box(.35,3,28,14,1.5,0,dark);

// Open sky / skylight effect.
const sky=new THREE.Mesh(new THREE.CircleGeometry(22,64),new THREE.MeshBasicMaterial({color:0x9eb9d1,side:THREE.DoubleSide}));
sky.rotation.x=Math.PI/2;sky.position.y=14;scene.add(sky);

// Photorealistic atrium backdrop placed behind the sculpture.
const atriumPanel=plane(15.5,8.0,0,4.1,-12.9,new THREE.MeshBasicMaterial({map:texture("assets/atrium.png"),side:THREE.DoubleSide}),0);
atriumPanel.userData.decor=true;
label("ÁTRIO DOS LIVROS",0,6.1,-11.9,0,.72);

// Spiral sculpture of books — central landmark.
const sculpture=new THREE.Group();museum.add(sculpture);
cylinder(3.6,.35,0,.18,0,stone,sculpture);
for(let i=0;i<42;i++){
  const a=i*.34, r=.45+i*.075, y=.55+i*.105;
  const b=box(1.55,.20,.52,Math.cos(a)*r,y,Math.sin(a)*r, i%3===0?gold:stone,sculpture);
  b.rotation.y=a+.35;
}
for(const x of [-8,8]){
  box(4,.48,.85,x,.45,-7,wood);
  box(4,.15,.85,x,.78,-7,wood);
}
// Flowers and trees in the atrium.
function tree(x,z,scale=1){
  cylinder(.16,1.6,x,.8,z,wood);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(1.0*scale,18,14),new THREE.MeshStandardMaterial({color:0x3d633c,roughness:.95}));
  crown.position.set(x,2.0,z);crown.castShadow=true;crown.receiveShadow=true;museum.add(crown);
}
for(const p of [[-10,-10],[10,-10],[-10,10],[10,10]]) tree(p[0],p[1],1.15);

// ---------- Galleries ----------
const galleryDefs=[
 {id:"g1",name:"Galeria I — Episódios 1–100",x:0,z:-28,w:22,d:24,axis:"z",color:0x314f3d,asset:"assets/gallery1.png"},
 {id:"g2",name:"Galeria II — Episódios 101–200",x:28,z:0,w:24,d:22,axis:"x",color:0x6a4738,asset:"assets/gallery2.png"},
 {id:"g3",name:"Galeria III — Episódios 201–300",x:0,z:28,w:22,d:24,axis:"z",color:0x4e4a32,asset:"assets/gallery1.png"},
 {id:"g4",name:"Galeria IV — Episódios 301–400",x:-28,z:0,w:24,d:22,axis:"x",color:0x32485b,asset:"assets/gallery_int.png"},
 {id:"g5",name:"Galeria V — Episódios 401–500",x:-26.5,z:-26.5,w:25,d:25,axis:"z",color:0x51384e,asset:"assets/gallery2.png"},
 {id:"g6",name:"Galeria VI — Episódios 501–600",x:26.5,z:26.5,w:25,d:25,axis:"z",color:0x40362e,asset:"assets/interior_real_01.png"}
];

const clickable=[];
function cover(ep,x,y,z,ry,color){
  const frame=box(1.12,1.82,.14,x,y,z,mat(0x9c8a70));frame.rotation.y=ry;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(.96,1.62),new THREE.MeshStandardMaterial({map:texture(`CAPAS/E${String(ep).padStart(3,"0")}.svg`),side:THREE.DoubleSide,roughness:.68}));
  m.position.set(x,y,z);m.rotation.y=ry;m.userData.episode=ep;m.castShadow=true;m.receiveShadow=true;museum.add(m);clickable.push(m);
}

function gallery(g,start){
  const group=new THREE.Group();museum.add(group);
  const wall=mat(g.color,.72);
  const floorMat=mat(0xb8b0a3,.45);
  box(g.w,.25,g.d,g.x,-.13,g.z,floorMat,group);
  // Full-height walls with explicit door gaps toward the atrium.
  if(g.axis==="z"){
    // Front wall: real opening at the atrium-side doorway.
    const sideW=(g.w-3.4)/2;
    box(sideW,7,.45,g.x-(g.w-sideW)/2,3.5,g.z-g.d/2,wall,group);
    box(sideW,7,.45,g.x+(g.w-sideW)/2,3.5,g.z-g.d/2,wall,group);
    box(g.w,7,.45,g.x,3.5,g.z+g.d/2,wall,group);
    box(.45,7,g.d,g.x-g.w/2,3.5,g.z,wall,group);
    box(.45,7,g.d,g.x+g.w/2,3.5,g.z,wall,group);
    // realistic interior panel on rear wall
    plane(g.w-1.0,5.0,g.x,3.25,g.z+g.d/2-.24,new THREE.MeshBasicMaterial({map:texture(g.asset),side:THREE.DoubleSide}),Math.PI);
  } else {
    box(.45,7,g.d,g.x-g.w/2,3.5,g.z,wall,group);
    box(.45,7,g.d,g.x+g.w/2,3.5,g.z,wall,group);
    box(g.w,7,.45,g.x,3.5,g.z-g.d/2,wall,group);
    // Atrium-side wall with a real doorway opening.
    const sideD=(g.d-3.4)/2;
    box(g.w,7,.45,g.x,3.5,g.z+(g.d-sideD)/2,wall,group);
    box(g.w,7,.45,g.x,3.5,g.z-(g.d-sideD)/2,wall,group);
    plane(g.d-1.0,5.0,g.x+g.w/2-.24,3.25,g.z,new THREE.MeshBasicMaterial({map:texture(g.asset),side:THREE.DoubleSide}),Math.PI/2);
  }
  label(g.name,g.x,6.1,g.z,0,.46);
  let ep=start;
  const positions=[];
  for(let i=0;i<10;i++){
    const t=(i+1)/11;
    if(g.axis==="z"){
      positions.push({x:g.x-g.w/2+.03,z:g.z-g.d/2+t*g.d,ry:Math.PI/2});
      positions.push({x:g.x+g.w/2-.03,z:g.z-g.d/2+t*g.d,ry:-Math.PI/2});
    }else{
      positions.push({x:g.x-g.w/2+t*g.w,z:g.z-g.d/2+.03,ry:0});
      positions.push({x:g.x-g.w/2+t*g.w,z:g.z+g.d/2-.03,ry:Math.PI});
    }
  }
  positions.slice(0,Math.min(20,EPISODE_COUNT-start+1)).forEach(p=>cover(ep++,p.x,1.85,p.z,p.ry,g.color));
}

galleryDefs.forEach((g,i)=>gallery(g,[1,21,41,61,81,1][i]||1));

// Door portals are visual only; collision logic below decides where passage is legal.
function door(x,z,rot,labelText){
  const frame=mat(0xd1c2aa,.4,.1), dmat=mat(0x211c18,.65);
  box(3.4,5.8,.35,x,2.9,z,frame).rotation.y=rot;
  box(2.65,5.15,.38,x,2.65,z-.02,dmat).rotation.y=rot;
  label(labelText,x,6.2,z+(rot===0?.25:0),rot,.42);
}
door(0,-14,"0","Entrada · Galeria I");
door(14,0,Math.PI/2,"Galeria II");
door(0,14,Math.PI,"Galeria III");
door(-14,0,-Math.PI/2,"Galeria IV");
door(-14,-14,0,"Galeria V");
door(14,14,Math.PI,"Galeria VI");

// ---------- Navigation / collision ----------
const keys={};
addEventListener("keydown",e=>{
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)){
    keys[e.code]=true;e.preventDefault();
  }
});
addEventListener("keyup",e=>{if(e.code in keys)keys[e.code]=false;});

let yaw=0, pitch=-.03;
let dragging=false,lastX=0,lastY=0,dragDistance=0;
renderer.domElement.addEventListener("pointerdown",e=>{dragging=true;dragDistance=0;lastX=e.clientX;lastY=e.clientY});
addEventListener("pointerup",()=>dragging=false);
addEventListener("pointermove",e=>{
  if(!dragging)return;
  const dx=e.clientX-lastX,dy=e.clientY-lastY;dragDistance+=Math.hypot(dx,dy);
  yaw-=dx*.0038;pitch-=dy*.0027;pitch=Math.max(-1.15,Math.min(1.15,pitch));lastX=e.clientX;lastY=e.clientY;
});

const joy={x:0,y:0,active:false};
const joystick=document.getElementById("joystick"),stick=document.getElementById("stick");
function joyMove(e){
  const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  let dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy),max=34;if(len>max){dx=dx/len*max;dy=dy/len*max}
  stick.style.transform=`translate(${dx}px,${dy}px)`;joy.x=dx/max;joy.y=dy/max;
}
joystick.addEventListener("pointerdown",e=>{joy.active=true;joystick.setPointerCapture(e.pointerId);joyMove(e)});
joystick.addEventListener("pointermove",e=>{if(joy.active)joyMove(e)});
joystick.addEventListener("pointerup",()=>{joy.active=false;joy.x=joy.y=0;stick.style.transform=""});

// ---------- Robust collision / navigation ----------
// Movement uses a small circular player radius and tests the proposed position
// against the actual museum footprint. This prevents tunnelling through thin walls
// and keeps the player inside the intended circulation areas.
function inRect(x,z,r,pad=0){
  return x>=r.x1-pad && x<=r.x2+pad && z>=r.z1-pad && z<=r.z2+pad;
}
const playerRadius=.48;

// Walkable rectangles. Door openings are explicitly added as connectors.
const zones=[
  {x1:-13.55,x2:13.55,z1:-13.55,z2:13.55},
  {x1:-13.55,x2:13.55,z1:13.55,z2:22.0},
  {x1:-13.55,x2:13.55,z1:-39.55,z2:-16.45},
  {x1:16.45,x2:39.55,z1:-11.0,z2:11.0},
  {x1:-11.0,x2:11.0,z1:16.45,z2:39.55},
  {x1:-39.55,x2:-16.45,z1:-11.0,z2:11.0},
  {x1:-38.95,x2:-14.05,z1:-38.95,z2:-14.05},
  {x1:14.05,x2:38.95,z1:14.05,z2:38.95}
];
const connectors=[
  {x1:-1.7,x2:1.7,z1:-17.5,z2:-12.7},
  {x1:12.7,x2:17.5,z1:-1.7,z2:1.7},
  {x1:-1.7,x2:1.7,z1:12.7,z2:17.5},
  {x1:-17.5,x2:-12.7,z1:-1.7,z2:1.7},
  {x1:-17.5,x2:-12.7,z1:-17.5,z2:-12.7},
  {x1:12.7,x2:17.5,z1:12.7,z2:17.5}
];

function walkablePoint(x,z){
  for(const r of zones) if(inRect(x,z,r,-playerRadius)) return true;
  for(const r of connectors) if(inRect(x,z,r,-playerRadius)) return true;
  return false;
}

function moveWithCollision(dx,dz){
  const p=camera.position;
  const tryX=p.x+dx, tryZ=p.z+dz;
  // Test each axis separately so the player slides along walls instead of sticking.
  if(walkablePoint(tryX,p.z)) p.x=tryX;
  if(walkablePoint(p.x,tryZ)) p.z=tryZ;
  p.x=THREE.MathUtils.clamp(p.x,-42,42);
  p.z=THREE.MathUtils.clamp(p.z,-42,25);
}
// ---------- Episode info/audio ----------
let selected=null,episodeIndex=null;
async function loadEpisodeIndex(){
  if(episodeIndex)return episodeIndex;
  try{
    const url=REPO+"/contents/"+encodeURIComponent(EP_FOLDER)+"?ref=main&per_page=1000";
    const r=await fetch(url,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)throw new Error();
    const entries=await r.json();const map={};
    entries.filter(e=>e.type==="file"&&/\.mp3$/i.test(e.name)).forEach(e=>{const m=e.name.match(/^(E\d+)(?!\d)/i);if(m)map[m[1].toUpperCase()]=e.download_url});
    episodeIndex=map;return map;
  }catch(e){episodeIndex={};return episodeIndex}
}
function showEpisode(ep){
  selected=ep;
  document.getElementById("infoTitle").textContent=`Episódio ${ep}`;
  document.getElementById("infoMeta").textContent=`Livro associado ao episódio E${String(ep).padStart(3,"0")}. A capa apresentada corresponde ao arquivo disponível no museu.`;
  document.getElementById("infoCover").style.backgroundImage=`url("CAPAS/E${String(ep).padStart(3,"0")}.svg")`;
  document.getElementById("info").classList.remove("hidden");
}
document.getElementById("playEpisode").onclick=async()=>{
  if(!selected)return;
  const code="E"+String(selected).padStart(3,"0");const map=await loadEpisodeIndex();
  const audio=document.getElementById("episodeAudio");
  if(!map[code]){alert("O áudio deste episódio ainda não foi encontrado no repositório do museu.");return;}
  audio.src=map[code];audio.play().catch(()=>{});
};

// ---------- Clicks ----------
const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
renderer.domElement.addEventListener("click",e=>{
  if(dragDistance>6)return;
  mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(mouse,camera);
  const hit=raycaster.intersectObjects(clickable)[0];if(hit)showEpisode(hit.object.userData.episode);
});

// ---------- UI ----------
const ambience=document.getElementById("ambience");
const musicBtn=document.getElementById("musicBtn");
musicBtn.onclick=()=>{if(ambience.paused){ambience.play().then(()=>musicBtn.textContent="🔇 Desligar música").catch(()=>{});}else{ambience.pause();musicBtn.textContent="🔊 Ligar música";}};
document.getElementById("helpBtn").onclick=()=>document.getElementById("help").classList.remove("hidden");
document.getElementById("closeHelp").onclick=()=>document.getElementById("help").classList.add("hidden");
document.getElementById("closeInfo").onclick=()=>document.getElementById("info").classList.add("hidden");

function roomName(){
  const x=camera.position.x,z=camera.position.z;
  if(Math.abs(x)<14&&Math.abs(z)<14)return "Átrio dos Livros";
  for(const g of galleryDefs)if(Math.abs(x-g.x)<g.w/2&&Math.abs(z-g.z)<g.d/2)return g.name;
  if(z>14)return "Entrada do Museu";
  return "Museu Virtual dos Livros";
}

function update(){
  camera.rotation.order="YXZ";camera.rotation.y=yaw;camera.rotation.x=pitch;
  const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  let f=(keys.ArrowUp?1:0)-(keys.ArrowDown?1:0);
  let s=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0);
  // Joystick: up = forward, down = backward.
  if(joy.active){f=-joy.y;s=joy.x;}
  const speed=.11;
  const move=forward.multiplyScalar(f*speed).add(right.multiplyScalar(s*speed));
  moveWithCollision(move.x,move.z);
  camera.position.y=1.72;
  document.getElementById("roomLabel").textContent=roomName();
}

function animate(){requestAnimationFrame(animate);update();renderer.render(scene,camera)}

// Start outside the museum, facing the real facade.
camera.position.set(0,1.72,25);yaw=0;pitch=-.04;
setTimeout(()=>document.getElementById("loading").style.display="none",900);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
loadEpisodeIndex();
animate();
