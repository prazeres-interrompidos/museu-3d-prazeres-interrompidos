import * as THREE from "three";

const EPISODES = 100;
const galleryDefs = [
  {name:"Galeria I — Episódios 1–100", range:[1,100], color:0x244b37},
  {name:"Galeria Internacional", range:null, color:0x27445c},
  {name:"Galeria dos Autores", range:null, color:0x563d2f},
  {name:"Galeria Temática", range:null, color:0x514b2d},
  {name:"Livros Imaginários", range:null, color:0x4c3150},
  {name:"Jardim da Leitura", range:null, color:0x304c32}
];

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.Fog(0x111111, 30, 110);

const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, .05, 180);
camera.position.set(0,1.7,12);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xffffff,0x222222,2.0);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff,2.2);
sun.position.set(15,25,10); sun.castShadow=true; scene.add(sun);

const museum = new THREE.Group();
scene.add(museum);

function mat(color, rough=.8){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:.05})}
function box(w,h,d,x,y,z,m,group=museum){
  const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.castShadow=true; o.receiveShadow=true; group.add(o); return o;
}
function floor(w,d,x=0,z=0,m=mat(0xddd8c8)){return box(w,.25,d,x,-.12,z,m)}
function label(text,x,y,z,rotY=0,size=1.0){
  const c=document.createElement("canvas"),ctx=c.getContext("2d");
  c.width=1024;c.height=256;ctx.fillStyle="#ffffff";ctx.font="bold 54px Georgia";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,512,128);
  const tex=new THREE.CanvasTexture(c); const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));
  s.position.set(x,y,z);s.scale.set(8*size,2*size,1);s.material.depthTest=false; museum.add(s); return s;
}

// Main atrium
floor(28,28,0,0);
box(28,5,.5,0,2.5,-14,mat(0x2b2b2b));
box(28,5,.5,0,2.5,14,mat(0x2b2b2b));
box(.5,5,28,-14,2.5,0,mat(0x2b2b2b));
box(.5,5,28,14,2.5,0,mat(0x2b2b2b));
label("ÁTRIO DOS LIVROS",0,4.3,-3,0,1.2);

// central sculpture
const spiral = new THREE.Group(); museum.add(spiral);
for(let i=0;i<80;i++){
  const a=i*.32, r=1.2+i*.025, y=.4+i*.075;
  const p=box(.22,.22,.22,Math.cos(a)*r,y,Math.sin(a)*r,mat(0x8b6a32),spiral);
}
label("MUSEU VIRTUAL DOS LIVROS",0,7,0,0,.9);

// Four large gallery wings, each with framed placeholder covers
const gallerySpots=[
  {name:"Galeria I — Episódios 1–100",x:0,z:-31,w:22,d:30,axis:"z",color:0x244b37,start:1},
  {name:"Galeria Internacional",x:31,z:0,w:30,d:22,axis:"x",color:0x27445c,start:1},
  {name:"Galeria dos Autores",x:0,z:31,w:22,d:30,axis:"z",color:0x563d2f,start:1},
  {name:"Galeria Temática",x:-31,z:0,w:30,d:22,axis:"x",color:0x514b2d,start:1},
  {name:"Livros Imaginários",x:-31,z:-31,w:22,d:22,axis:"z",color:0x4c3150,start:1},
  {name:"Jardim da Leitura",x:31,z:31,w:22,d:22,axis:"z",color:0x304c32,start:1}
];

const clickable=[];
function makeGallery(g){
  const group=new THREE.Group(); museum.add(group);
  const wall=mat(g.color);
  floor(g.w,g.d,g.x,g.z,mat(0xbdb8aa));
  if(g.axis==="z"){
    box(g.w,6,.5,g.x,3,g.z-g.d/2,wall,group);
    box(g.w,6,.5,g.x,3,g.z+g.d/2,wall,group);
    box(.5,6,g.d,g.x-g.w/2,3,g.z,wall,group);
    box(.5,6,g.d,g.x+g.w/2,3,g.z,wall,group);
  } else {
    box(.5,6,g.d,g.x-g.w/2,3,g.z,wall,group);
    box(.5,6,g.d,g.x+g.w/2,3,g.z,wall,group);
    box(g.w,6,.5,g.x,3,g.z-g.d/2,wall,group);
    box(g.w,6,.5,g.x,3,g.z+g.d/2,wall,group);
  }
  label(g.name,g.x,5.2,g.z,0,.65);
  // 100 display positions distributed around perimeter; only first 100 are used for the prototype.
  const positions=[];
  const cols=10, rows=5;
  for(let i=0;i<10;i++){
    const t=(i+1)/11;
    positions.push({x:g.x-g.w/2+g.w*t,z:g.z-g.d/2+.03,ry:0});
    positions.push({x:g.x-g.w/2+g.w*t,z:g.z+g.d/2-.03,ry:Math.PI});
    positions.push({x:g.x-g.w/2+.03,z:g.z-g.d/2+g.d*t,ry:Math.PI/2});
    positions.push({x:g.x+g.w/2-.03,z:g.z-g.d/2+g.d*t,ry:-Math.PI/2});
  }
  positions.slice(0,40).forEach((p,i)=>{
    const ep=i+1;
    addCover(ep,p.x,1.9,p.z,p.ry,g.color);
  });
}
function coverTexture(ep,color){
  const c=document.createElement("canvas");c.width=256;c.height=360;
  const ctx=c.getContext("2d");
  ctx.fillStyle="#"+color.toString(16).padStart(6,"0");ctx.fillRect(0,0,256,360);
  ctx.fillStyle="#fff";ctx.textAlign="center";
  ctx.font="bold 25px Georgia";ctx.fillText("PRAZERES",128,80);ctx.fillText("INTERROMPIDOS",128,112);
  ctx.font="bold 58px Georgia";ctx.fillText("E"+String(ep).padStart(3,"0"),128,205);
  ctx.font="18px Georgia";ctx.fillText("LIVRO",128,250);
  const tex=new THREE.CanvasTexture(c);return tex;
}
function addCover(ep,x,y,z,ry,color){
  const frame=box(1.25,2.25,.18,x,y,z,mat(0x8a806e));
  frame.rotation.y=ry;
  const cover=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.95),new THREE.MeshStandardMaterial({map:coverTexture(ep,color),side:THREE.DoubleSide}));
  cover.position.set(x,y,z+(.11*Math.cos(ry))); cover.rotation.y=ry; cover.userData={episode:ep};
  cover.castShadow=true; museum.add(cover); clickable.push(cover);
}
gallerySpots.forEach(makeGallery);

// Connectors/entrances
for(const [x,z] of [[0,-15],[15,0],[0,15],[-15,0],[-15,-15],[15,15]]) {
  box(3,4,3,x,2,z,mat(0x6c6c6c));
}

// Garden
for(let i=0;i<35;i++){
  const a=Math.random()*Math.PI*2,r=7+Math.random()*8;
  const trunk=box(.25,2,.25,31+Math.cos(a)*r,1,31+Math.sin(a)*r,mat(0x65462d));
  const crown=new THREE.Mesh(new THREE.SphereGeometry(1.3+Math.random(),10,8),mat(0x315c34));
  crown.position.set(trunk.position.x,2.6,trunk.position.z);museum.add(crown);
}

const keys={};
addEventListener("keydown",e=>{keys[e.code]=true;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault()});
addEventListener("keyup",e=>keys[e.code]=false);

let yaw=0,pitch=0;
let dragging=false,lastX=0,lastY=0;
renderer.domElement.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY});
addEventListener("pointerup",()=>dragging=false);
addEventListener("pointermove",e=>{
  if(!dragging)return;
  yaw-= (e.clientX-lastX)*.004; pitch-= (e.clientY-lastY)*.003;
  pitch=Math.max(-1.35,Math.min(1.35,pitch));lastX=e.clientX;lastY=e.clientY;
});

const joy={x:0,y:0,active:false};
const joystick=document.getElementById("joystick"),stick=document.getElementById("stick");
function joyMove(e){
  const r=joystick.getBoundingClientRect(), cx=r.left+r.width/2,cy=r.top+r.height/2;
  let dx=e.clientX-cx,dy=e.clientY-cy, len=Math.hypot(dx,dy), max=34;
  if(len>max){dx=dx/len*max;dy=dy/len*max}
  stick.style.transform=`translate(${dx}px,${dy}px)`;
  joy.x=dx/max;joy.y=dy/max;
}
joystick.addEventListener("pointerdown",e=>{joy.active=true;joystick.setPointerCapture(e.pointerId);joyMove(e)});
joystick.addEventListener("pointermove",e=>{if(joy.active)joyMove(e)});
joystick.addEventListener("pointerup",()=>{joy.active=false;joy.x=joy.y=0;stick.style.transform=""});

const ambience=document.getElementById("ambience");
document.getElementById("musicBtn").onclick=()=>{
  if(ambience.paused){ambience.play().then(()=>musicBtn.textContent="🔇 Desligar música").catch(()=>{});}
  else{ambience.pause();musicBtn.textContent="🔊 Ligar música";}
};
const musicBtn=document.getElementById("musicBtn");

document.getElementById("helpBtn").onclick=()=>document.getElementById("help").classList.remove("hidden");
document.getElementById("closeHelp").onclick=()=>document.getElementById("help").classList.add("hidden");
document.getElementById("closeInfo").onclick=()=>document.getElementById("info").classList.add("hidden");

const raycaster=new THREE.Raycaster(), mouse=new THREE.Vector2();
let selected=null;
renderer.domElement.addEventListener("click",e=>{
  if(Math.abs(e.clientX-lastX)>5 || Math.abs(e.clientY-lastY)>5)return;
  mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(mouse,camera);
  const hit=raycaster.intersectObjects(clickable)[0];
  if(hit)showEpisode(hit.object.userData.episode);
});
function showEpisode(ep){
  selected=ep;
  document.getElementById("infoTitle").textContent=`Episódio ${ep}`;
  document.getElementById("infoMeta").textContent=`Livro associado ao episódio E${String(ep).padStart(3,"0")}. Substitua a imagem de exemplo em CAPAS e o áudio em EPISÓDIOS PARA O MUSEU.`;
  document.getElementById("infoCover").style.backgroundImage=`url("CAPAS/E${String(ep).padStart(3,"0")}.jpg")`;
  document.getElementById("info").classList.remove("hidden");
}
document.getElementById("playEpisode").onclick=()=>{
  if(!selected)return;
  const audio=document.getElementById("episodeAudio");
  audio.src=`EPISÓDIOS PARA O MUSEU/E${String(selected).padStart(3,"0")}.mp3`;
  audio.play().catch(()=>alert("O áudio deste episódio ainda não foi colocado na pasta EPISÓDIOS PARA O MUSEU."));
};

function update(){
  camera.rotation.order="YXZ";camera.rotation.y=yaw;camera.rotation.x=pitch;
  const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  let moveZ=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);
  let moveX=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  if(joy.active){moveZ=-joy.y;moveX=joy.x}
  const speed=.11;
  camera.position.addScaledVector(forward,moveZ*speed);
  camera.position.addScaledVector(right,moveX*speed);
  camera.position.y=1.7;
  // museum boundary
  camera.position.x=THREE.MathUtils.clamp(camera.position.x,-52,52);
  camera.position.z=THREE.MathUtils.clamp(camera.position.z,-52,52);

  const d=Math.hypot(camera.position.x,camera.position.z);
  let room="Átrio dos Livros";
  if(camera.position.z<-16)room="Galeria I — Episódios 1–100";
  else if(camera.position.x>16&&camera.position.z<16)room="Galeria Internacional";
  else if(camera.position.z>16)room="Galeria dos Autores";
  else if(camera.position.x<-16&&camera.position.z<16)room="Galeria Temática";
  if(camera.position.x<-16&&camera.position.z<-16)room="Livros Imaginários";
  if(camera.position.x>16&&camera.position.z>16)room="Jardim da Leitura";
  document.getElementById("roomLabel").textContent=room;
}

function animate(){requestAnimationFrame(animate);update();renderer.render(scene,camera)}
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
animate();
setTimeout(()=>document.getElementById("loading").style.display="none",700);
