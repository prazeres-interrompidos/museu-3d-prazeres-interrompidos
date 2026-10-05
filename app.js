import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

// Museu Virtual dos Livros — Prazeres Interrompidos
// Primeira construção: arquitectura, mobiliário, iluminação e colisões.
// Não existem corredores nem portas: todas as salas abrem directamente para o átrio.

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9d1c4);
scene.fog = new THREE.Fog(0xd9d1c4, 35, 95);

const camera = new THREE.PerspectiveCamera(72, innerWidth/innerHeight, 0.05, 120);
// Posição inicial: no exterior da Entrada Principal, virado para dentro do museu.
camera.position.set(0, 1.7, 26.0);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

const ambient = new THREE.HemisphereLight(0xfff5e7,0x6f665b,1.55); scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff0d8,1.4); sun.position.set(-18,26,18); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-35; sun.shadow.camera.right=35; sun.shadow.camera.top=35; sun.shadow.camera.bottom=-35; scene.add(sun);

const colliders=[];
const roomAreas=[];
const mats={
  floor:new THREE.MeshStandardMaterial({color:0xe7dfd0,roughness:.52,metalness:.03}),
  wall:new THREE.MeshStandardMaterial({color:0x4c4a47,roughness:.68}),
  innerWall:new THREE.MeshStandardMaterial({color:0xeee7da,roughness:.72}),
  wood:new THREE.MeshStandardMaterial({color:0x6f4d2e,roughness:.46}),
  woodDark:new THREE.MeshStandardMaterial({color:0x30261d,roughness:.55}),
  cushion:new THREE.MeshStandardMaterial({color:0x252628,roughness:.78}),
  gold:new THREE.MeshStandardMaterial({color:0xb59b66,metalness:.65,roughness:.25}),
  planter:new THREE.MeshStandardMaterial({color:0x8c8174,roughness:.62}),
  leaf:new THREE.MeshStandardMaterial({color:0x38573a,roughness:.86}),
  trunk:new THREE.MeshStandardMaterial({color:0x5a3c26,roughness:.9}),
  glass:new THREE.MeshPhysicalMaterial({color:0xf5ead8,transparent:true,opacity:.2,roughness:.1,metalness:.05}),
};

function box(name,x,y,z,sx,sy,sz,mat,collide=false){
  const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat); m.name=name; m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; scene.add(m);
  if(collide) colliders.push({minX:x-sx/2,maxX:x+sx/2,minZ:z-sz/2,maxZ:z+sz/2,minY:0,maxY:3.8});
  return m;
}
function cylinder(name,x,y,z,r,h,mat,collide=false){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);if(collide)colliders.push({minX:x-r,maxX:x+r,minZ:z-r,maxZ:z+r,minY:0,maxY:h});return m;}

// Dimensions follow the approved plan: six galleries around a central open atrium.
const A=16; // central atrium width/depth
const RW=14, RD=11, H=4.2, WT=.42;

// Main floor
box('Piso',0,-.12,0,56,.24,45,mats.floor,false);

function floorRoom(cx,cz){box('Pavimento',cx,.02,cz,RW,.16,RD,mats.floor,false);}
function wallSegment(x,z,sx,sz,mat=mats.wall){return box('Parede',x,H/2,z,sx,H,sz,mat,true);}

// Rooms: bottom = 1/2, middle = 3/4, top = 5/6.
const rooms=[
 {id:1,label:'SALA 1',episodes:'EPISÓDIOS 1–100',cx:-9.5,cz:13.2},
 {id:2,label:'SALA 2',episodes:'EPISÓDIOS 101–200',cx:9.5,cz:13.2},
 {id:3,label:'SALA 3',episodes:'EPISÓDIOS 201–300',cx:-18.0,cz:0},
 {id:4,label:'SALA 4',episodes:'EPISÓDIOS 301–400',cx:18.0,cz:0},
 {id:5,label:'SALA 5',episodes:'EPISÓDIOS 401–500',cx:-9.5,cz:-13.2},
 {id:6,label:'SALA 6',episodes:'EPISÓDIOS 501–600',cx:9.5,cz:-13.2}
];
rooms.forEach(r=>{floorRoom(r.cx,r.cz);roomAreas.push({r,minX:r.cx-RW/2+0.3,maxX:r.cx+RW/2-0.3,minZ:r.cz-RD/2+0.3,maxZ:r.cz+RD/2-0.3});});

// Central atrium floor
box('Atrio',0,.02,0,A,.16,A,mats.floor,false);

// Room walls with a single broad opening towards the atrium. No doors, no corridors.
function buildRoomShell(r,side){
  const L=RW/2, D=RD/2, x=r.cx,z=r.cz, opening=5.4;
  // Back wall
  wallSegment(x, z + (side==='vertical' ? (z<0?D:-D) : D), RW, WT);
  // For vertical rooms (top/bottom), opening is on side facing centre (z direction).
  // For horizontal rooms, opening is on side facing centre (x direction).
  if(side==='vertical'){
    const frontZ=z+(z>0?-D:D);
    const leftLen=(RW-opening)/2;
    wallSegment(x-L+leftLen/2,frontZ,leftLen,WT);
    wallSegment(x+L-leftLen/2,frontZ,leftLen,WT);
    wallSegment(x-L, z, WT,RD);
    wallSegment(x+L, z, WT,RD);
  } else {
    const frontX=x+(x>0?-L:L);
    const leftLen=(RD-opening)/2;
    wallSegment(frontX,z-D+leftLen/2,WT,leftLen);
    wallSegment(frontX,z+D-leftLen/2,WT,leftLen);
    wallSegment(x,z-D,RW,WT);
    wallSegment(x,z+D,RW,WT);
  }
}
rooms.forEach(r=>buildRoomShell(r,(r.id===1||r.id===2||r.id===5||r.id===6)?'vertical':'horizontal'));

// Entrance front wall: central opening.
wallSegment(-7.0,22.2,14,WT); wallSegment(7.0,22.2,14,WT); // side blocks leave a 14m entrance

// Ceiling beams / decorative crown lines, kept away from openings.
rooms.forEach(r=>{
  box('Cornija',r.cx,H+.05,r.cz-RD/2+.25,RW,.12,.22,mats.gold,false);
});

// Cover display: 100 reserved frames per room. Frames are light and spaced around walls.
function coverTexture(text){
  const c=document.createElement('canvas'); c.width=180;c.height=240; const g=c.getContext('2d');
  g.fillStyle='#eee5d5';g.fillRect(0,0,c.width,c.height);g.fillStyle='#b79a68';g.fillRect(10,10,c.width-20,c.height-20);
  g.fillStyle='#fffaf0';g.font='bold 18px Georgia';g.textAlign='center';g.fillText(text,c.width/2,120);g.font='12px Arial';g.fillText('Prazeres Interrompidos',c.width/2,150);
  return new THREE.CanvasTexture(c);
}
function frame(x,y,z,rotY,label){
  const group=new THREE.Group(); group.position.set(x,y,z); group.rotation.y=rotY;
  const frameMat=mats.gold; const artMat=new THREE.MeshStandardMaterial({map:coverTexture(label),roughness:.8});
  const outer=new THREE.Mesh(new THREE.BoxGeometry(.72,1.02,.08),frameMat); outer.castShadow=true; group.add(outer);
  const art=new THREE.Mesh(new THREE.PlaneGeometry(.58,.82),artMat); art.position.z=-.045; group.add(art); scene.add(group);
}
function addFrames(r){
  const x=r.cx,z=r.cz,L=RW/2,D=RD/2; const rows=25;
  // 25 per wall = 100 per room, leaving central furniture space.
  for(let i=0;i<rows;i++){
    const t=(i+.5)/rows; const xx=x-L+.7+t*(RW-1.4), zz=z-D+.23;
    frame(xx,2.45,zz,0,`E${String((r.id-1)*100+i+1).padStart(3,'0')}`);
    frame(xx,2.45,z+D-.23,Math.PI,`E${String((r.id-1)*100+26+i).padStart(3,'0')}`);
    const zSide=z-D+.7+t*(RD-1.4); const ep3=(r.id-1)*100+51+i;
    frame(x-L+.23,2.45,zSide,Math.PI/2,`E${String(ep3).padStart(3,'0')}`);
    frame(x+L-.23,2.45,zSide,-Math.PI/2,`E${String(ep3+25).padStart(3,'0')}`);
  }
}
rooms.forEach(addFrames);

// Furniture
function bench(x,z,rot=0){const g=new THREE.Group();g.position.set(x,.55,z);g.rotation.y=rot;scene.add(g);const seat=new THREE.Mesh(new THREE.BoxGeometry(3.2,.28,.62),mats.wood);seat.castShadow=true;g.add(seat);const cushion=new THREE.Mesh(new THREE.BoxGeometry(2.9,.18,.54),mats.cushion);cushion.position.y=.23;cushion.castShadow=true;g.add(cushion);for(const sx of [-1.25,1.25]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.16,.55,.16),mats.woodDark);leg.position.set(sx,-.28,0);leg.castShadow=true;g.add(leg)}}
function lowTable(x,z,rot=0){const g=new THREE.Group();g.position.set(x,.42,z);g.rotation.y=rot;scene.add(g);const top=new THREE.Mesh(new THREE.BoxGeometry(2.8,.16,1.0),mats.wood);top.castShadow=true;g.add(top);for(const dx of [-1.05,1.05])for(const dz of [-.3,.3]){const l=new THREE.Mesh(new THREE.BoxGeometry(.12,.42,.12),mats.woodDark);l.position.set(dx,-.22,dz);l.castShadow=true;g.add(l)}}
function sofa(x,z,rot=0){const g=new THREE.Group();g.position.set(x,.58,z);g.rotation.y=rot;scene.add(g);const base=new THREE.Mesh(new THREE.BoxGeometry(3.4,.42,.9),mats.woodDark);base.castShadow=true;g.add(base);const seat=new THREE.Mesh(new THREE.BoxGeometry(3.2,.24,.82),mats.cushion);seat.position.y=.28;seat.castShadow=true;g.add(seat);const back=new THREE.Mesh(new THREE.BoxGeometry(3.2,.72,.16),mats.cushion);back.position.set(0,.58,.33);back.castShadow=true;g.add(back)}
function addFurniture(r){const x=r.cx,z=r.cz; bench(x,z+1.9);bench(x,z-2.1);bench(x-4.5,z,Math.PI/2);bench(x+4.5,z,Math.PI/2); sofa(x,z+3.9); lowTable(x,z-3.6);}
rooms.forEach(addFurniture);

// Plants
function plant(x,z,scale=1){const g=new THREE.Group();g.position.set(x,.1,z);g.scale.setScalar(scale);scene.add(g);const pot=new THREE.Mesh(new THREE.CylinderGeometry(.45,.58,.65,20),mats.planter);pot.position.y=.33;pot.castShadow=true;g.add(pot);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,.9,10),mats.trunk);trunk.position.y=1.05;trunk.castShadow=true;g.add(trunk);for(let i=0;i<8;i++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),mats.leaf);const a=i*Math.PI/4;leaf.position.set(Math.cos(a)*.42,1.35+Math.sin(i*2)*.12,Math.sin(a)*.42);leaf.scale.set(1,.7,1);leaf.castShadow=true;g.add(leaf)}}
rooms.forEach(r=>{const x=r.cx,z=r.cz;plant(x-5.4,z-4.0,.9);plant(x+5.4,z-4.0,.9);plant(x-5.4,z+4.0,.85);plant(x+5.4,z+4.0,.85);});
// Central round feature
cylinder('Mesa central',0,.55,0,1.8,1.0,mats.innerWall,true);cylinder('Vaso central',0,1.15,0,.8,.9,mats.planter,false);plant(0,0,.85);
for(let i=0;i<6;i++){const a=i*Math.PI/3; lowTable(Math.cos(a)*3.0,Math.sin(a)*3.0,a+Math.PI/2)}

// Lighting per gallery: warm spot-like point lights aimed from ceiling.
rooms.forEach(r=>{
  const positions=[[-4,-3],[0,-3],[4,-3],[-4,3],[0,3],[4,3]];
  positions.forEach(([dx,dz])=>{const l=new THREE.PointLight(0xffe6bd,55,8,2);l.position.set(r.cx+dx,H-.25,r.cz+dz);l.castShadow=true;scene.add(l);});
});
for(const [x,z] of [[-7,7],[7,7],[-7,-7],[7,-7],[-12,0],[12,0]]){const l=new THREE.PointLight(0xffe8c2,75,10,2);l.position.set(x,3.8,z);scene.add(l)}

// Entry monument/sign
const sign=box('Placa',0,2.7,21.6,6.4,1.9,.12,mats.innerWall,false);
const signTex=coverTexture('ENTRADA\nPRINCIPAL'); const signArt=new THREE.Mesh(new THREE.PlaneGeometry(5.8,1.5),new THREE.MeshStandardMaterial({map:signTex,roughness:.9}));signArt.position.set(0,2.7,21.5);scene.add(signArt);

// Collision system: swept, axis-separated movement with a player radius.
const player={radius:.34,height:1.72,yaw:0, speed:3.4};
let keys={};
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys[e.code]=true}});
addEventListener('keyup',e=>{keys[e.code]=false});

function blocked(x,z){
  const r=player.radius;
  for(const c of colliders){
    if(x>c.minX-r && x<c.maxX+r && z>c.minZ-r && z<c.maxZ+r) return true;
  }
  return false;
}
function moveWithCollision(dx,dz){
  const x=camera.position.x,z=camera.position.z;
  // Resolve each axis independently; this prevents tunnelling and wall clipping.
  if(!blocked(x+dx,z)) camera.position.x+=dx;
  if(!blocked(camera.position.x,z+dz)) camera.position.z+=dz;
}

function updateRoomLabel(){
  let best='ENTRADA PRINCIPAL';
  for(const a of roomAreas){
    if(camera.position.x>=a.minX && camera.position.x<=a.maxX && camera.position.z>=a.minZ && camera.position.z<=a.maxZ){
      best=`${a.r.label} — ${a.r.episodes}`; break;
    }
  }
  document.getElementById('roomLabel').textContent=best;
}

const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
  let f=0,s=0;if(keys.ArrowUp)f+=1;if(keys.ArrowDown)f-=1;if(keys.ArrowLeft)camera.rotation.y+=1.65*dt;if(keys.ArrowRight)camera.rotation.y-=1.65*dt;
  if(f!==0){const dir=new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0),camera.rotation.y);moveWithCollision(dir.x*f*player.speed*dt,dir.z*f*player.speed*dt)}
  camera.position.y=player.height;updateRoomLabel();renderer.render(scene,camera);
}
animate();
setTimeout(()=>document.getElementById('loading').classList.add('hidden'),400);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
