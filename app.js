(function () {
'use strict';

function showError(message) {
  var el = document.getElementById('error');
  var load = document.getElementById('loading');
  if (el) { el.hidden = false; el.textContent = message; }
  if (load) load.classList.add('hidden');
}

try {
  if (!window.THREE) throw new Error('Three.js não foi carregado a partir de three.min.js.');

  var THREE = window.THREE;
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd9d1c4);
  scene.fog = new THREE.Fog(0xd9d1c4, 45, 110);

  var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 150);
  camera.position.set(0, 1.72, 17.5);
  camera.rotation.order = 'YXZ';
  camera.lookAt(0, 1.72, 0);

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ('outputEncoding' in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
  if ('toneMapping' in renderer) renderer.toneMapping = THREE.ACESFilmicToneMapping;
  if ('toneMappingExposure' in renderer) renderer.toneMappingExposure = 1.0;
  document.body.appendChild(renderer.domElement);

  var ambient = new THREE.HemisphereLight(0xffffff, 0x665f56, 1.8);
  scene.add(ambient);
  var mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
  mainLight.position.set(-15, 25, 20);
  mainLight.castShadow = true;
  scene.add(mainLight);

  var mats = {
    floor: new THREE.MeshStandardMaterial({color:0xd7cbbb, roughness:.82}),
    wall: new THREE.MeshStandardMaterial({color:0xe9e3d9, roughness:.76}),
    wallDark: new THREE.MeshStandardMaterial({color:0x514b45, roughness:.8}),
    gold: new THREE.MeshStandardMaterial({color:0xb79b68, metalness:.35, roughness:.3}),
    roomFloors: [
      new THREE.MeshStandardMaterial({color:0xc9a38d, roughness:.86}),
      new THREE.MeshStandardMaterial({color:0xb7c7b1, roughness:.86}),
      new THREE.MeshStandardMaterial({color:0xa9bccb, roughness:.86}),
      new THREE.MeshStandardMaterial({color:0xd2bb86, roughness:.86}),
      new THREE.MeshStandardMaterial({color:0xb9a7bf, roughness:.86}),
      new THREE.MeshStandardMaterial({color:0x9ebdb8, roughness:.86})
    ]
  };

  var colliders = [];
  var roomAreas = [];

  function box(name, x, y, z, sx, sy, sz, material, collide) {
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
    mesh.name = name;
    mesh.position.set(x,y,z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    if (collide) colliders.push({
      minX:x-sx/2, maxX:x+sx/2,
      minZ:z-sz/2, maxZ:z+sz/2
    });
    return mesh;
  }

  function wall(x,z,sx,sz) { return box('Parede',x,2.1,z,sx,4.2,sz,mats.wall,true); }

  // Ground: deliberately oversized so the visitor always has a visible floor.
  box('Piso geral',0,-0.15,0,58,0.3,50,mats.floor,false);

  var RW=14, RD=11, H=4.2, WT=.42;
  var rooms = [
    {id:1,label:'SALA 1',episodes:'EPISÓDIOS 1–100',cx:-9.5,cz:9.0},
    {id:2,label:'SALA 2',episodes:'EPISÓDIOS 101–200',cx:9.5,cz:9.0},
    {id:3,label:'SALA 3',episodes:'EPISÓDIOS 201–300',cx:-18,cz:-2.0},
    {id:4,label:'SALA 4',episodes:'EPISÓDIOS 301–400',cx:18,cz:-2.0},
    {id:5,label:'SALA 5',episodes:'EPISÓDIOS 401–500',cx:-9.5,cz:-13.2},
    {id:6,label:'SALA 6',episodes:'EPISÓDIOS 501–600',cx:9.5,cz:-13.2}
  ];

  // Central entrance/atrium.
  box('Átrio',0,.02,0,16,.16,14,mats.floor,false);

  // Each room has its own floor colour. The walls remain neutral so the
  // visitor can immediately distinguish the six galleries.
  rooms.forEach(function(r){
    box('Pavimento Sala '+r.id,r.cx,0.055,r.cz,RW-.84,.10,RD-.84,mats.roomFloors[r.id-1],false);
  });

  // Build each room as four walls with a 5.4 m opening on the side facing the atrium.
  rooms.forEach(function(r){
    var L=RW/2, D=RD/2, x=r.cx, z=r.cz, opening=5.4;
    var sideOpening=opening;
    if (r.id===1 || r.id===2) {
      // South wall opens to the entrance.
      // Two solid pieces leave a 5.4 m open passage.
      var sideLen=(RW-sideOpening)/2;
      wall(x-L+sideLen/2,z-D,sideLen,WT);
      wall(x+L-sideLen/2,z-D,sideLen,WT);
      wall(x,z+D,RW,WT);
      wall(x-L,z,WT,RD);
      wall(x+L,z,WT,RD);
    } else if (r.id===5 || r.id===6) {
      // North wall opens to the central space.
      var sideLen2=(RW-sideOpening)/2;
      wall(x-L+sideLen2/2,z+D,sideLen2,WT);
      wall(x+L-sideLen2/2,z+D,sideLen2,WT);
      wall(x,z-D,RW,WT);
      wall(x-L,z,WT,RD);
      wall(x+L,z,WT,RD);
    } else if (r.id===3) {
      // East side opens toward the atrium.
      var sideLen3=(RD-sideOpening)/2;
      wall(x+L,z-D+sideLen3/2,WT,sideLen3);
      wall(x+L,z+D-sideLen3/2,WT,sideLen3);
      wall(x-L,z,WT,RD);
      wall(x,z-D,RW,WT);
      wall(x,z+D,RW,WT);
    } else if (r.id===4) {
      // West side opens toward the atrium.
      var sideLen4=(RD-sideOpening)/2;
      wall(x-L,z-D+sideLen4/2,WT,sideLen4);
      wall(x-L,z+D-sideLen4/2,WT,sideLen4);
      wall(x+L,z,WT,RD);
      wall(x,z-D,RW,WT);
      wall(x,z+D,RW,WT);
    }
    roomAreas.push({
      r:r,
      minX:x-L+.35,maxX:x+L-.35,
      minZ:z-D+.35,maxZ:z+D-.35
    });
  });

  // Entrance exterior wall, with a wide open central passage.
  wall(-10.5,16.0,7,WT);
  wall(10.5,16.0,7,WT);

  // Simple ceiling frames and book placeholders.
  function coverTexture(text) {
    var c=document.createElement('canvas');
    c.width=180;c.height=240;
    var g=c.getContext('2d');
    g.fillStyle='#eee5d5';g.fillRect(0,0,c.width,c.height);
    g.fillStyle='#a78b5d';g.fillRect(10,10,c.width-20,c.height-20);
    g.fillStyle='#fffaf0';g.font='bold 18px Georgia';g.textAlign='center';
    g.fillText(text,c.width/2,118);
    g.font='12px Arial';g.fillText('Prazeres Interrompidos',c.width/2,150);
    return new THREE.CanvasTexture(c);
  }

  function frame(x,y,z,rot,label) {
    var g=new THREE.Group();
    g.position.set(x,y,z);g.rotation.y=rot;
    var outer=new THREE.Mesh(new THREE.BoxGeometry(.72,1.02,.08),mats.gold);
    var art=new THREE.Mesh(
      new THREE.PlaneGeometry(.58,.82),
      new THREE.MeshStandardMaterial({map:coverTexture(label),roughness:.8})
    );
    art.position.z=-.045;
    g.add(outer);g.add(art);scene.add(g);
  }

  rooms.forEach(function(r){
    var L=RW/2,D=RD/2,x=r.cx,z=r.cz;
    for(var i=0;i<25;i++){
      var t=(i+.5)/25;
      var xx=x-L+.8+t*(RW-1.6);
      var n=(r.id-1)*100+i+1;
      frame(xx,2.45,z-D+.23,0,'E'+String(n).padStart(3,'0'));
      frame(xx,2.45,z+D-.23,Math.PI,'E'+String(n+25).padStart(3,'0'));
      var zz=z-D+.8+t*(RD-1.6);
      frame(x-L+.23,2.45,zz,Math.PI/2,'E'+String(n+50).padStart(3,'0'));
      frame(x+L-.23,2.45,zz,-Math.PI/2,'E'+String(n+75).padStart(3,'0'));
    }
  });

  // The museum is intentionally kept open: no benches and no plants.

  // Lighting.
  rooms.forEach(function(r){
    [-4,0,4].forEach(function(px){
      var l=new THREE.PointLight(0xffe7c5,32,10,2);
      l.position.set(r.cx+px,3.8,r.cz);
      scene.add(l);
    });
  });
  var atriumLight=new THREE.PointLight(0xffedcf,65,14,2);
  atriumLight.position.set(0,3.7,3);
  scene.add(atriumLight);

  // Entrance sign.
  var sign=box('Placa entrada',0,3.0,15.72,7.5,2.0,.12,mats.wallDark,false);
  var signArt=new THREE.Mesh(
    new THREE.PlaneGeometry(6.8,1.35),
    new THREE.MeshBasicMaterial({map:coverTexture('MUSEU VIRTUAL DOS LIVROS')})
  );
  signArt.position.set(0,3.0,15.64);
  scene.add(signArt);

  // Movement and collision.
  var player={radius:.45,height:1.72,speed:3.6};
  var keys={};
  var touchMove={x:0,y:0,active:false};
  function isArrow(code){return code==='ArrowUp'||code==='ArrowDown'||code==='ArrowLeft'||code==='ArrowRight';}
  window.addEventListener('keydown',function(e){
    if(isArrow(e.code)){keys[e.code]=true;e.preventDefault();}
  },{passive:false});
  window.addEventListener('keyup',function(e){if(isArrow(e.code))keys[e.code]=false;},{passive:false});

  // Mobile joystick: vertical axis moves forward/backward, horizontal axis turns.
  var joystick=document.getElementById('joystick');
  var stick=document.getElementById('stick');
  var joyPointer=null;
  function setJoystick(clientX,clientY){
    var rect=joystick.getBoundingClientRect();
    var cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
    var dx=clientX-cx, dy=clientY-cy;
    var max=rect.width*.34;
    var len=Math.sqrt(dx*dx+dy*dy);
    if(len>max){ dx*=max/len; dy*=max/len; }
    touchMove.x=dx/max;
    touchMove.y=dy/max;
    touchMove.active=true;
    stick.style.transform='translate('+dx+'px,'+dy+'px)';
  }
  function resetJoystick(){
    touchMove.x=0; touchMove.y=0; touchMove.active=false; joyPointer=null;
    stick.style.transform='translate(0,0)';
  }
  if(joystick){
    joystick.addEventListener('pointerdown',function(e){
      joyPointer=e.pointerId; joystick.setPointerCapture(e.pointerId); setJoystick(e.clientX,e.clientY); e.preventDefault();
    },{passive:false});
    joystick.addEventListener('pointermove',function(e){
      if(joyPointer===e.pointerId){ setJoystick(e.clientX,e.clientY); e.preventDefault(); }
    },{passive:false});
    joystick.addEventListener('pointerup',resetJoystick,{passive:false});
    joystick.addEventListener('pointercancel',resetJoystick,{passive:false});
  }

  function blocked(x,z){
    var r=player.radius;
    for(var i=0;i<colliders.length;i++){
      var c=colliders[i];
      if(x>c.minX-r && x<c.maxX+r && z>c.minZ-r && z<c.maxZ+r) return true;
    }
    return false;
  }

  function move(dx,dz){
    var x=camera.position.x,z=camera.position.z;
    var nx=x+dx,nz=z+dz;
    if(!blocked(nx,z)) x=nx;
    if(!blocked(x,nz)) z=nz;
    camera.position.x=x;camera.position.z=z;
  }

  function updateLabel(){
    var label='ENTRADA PRINCIPAL';
    for(var i=0;i<roomAreas.length;i++){
      var a=roomAreas[i];
      if(camera.position.x>=a.minX&&camera.position.x<=a.maxX&&camera.position.z>=a.minZ&&camera.position.z<=a.maxZ){
        label=a.r.label+' — '+a.r.episodes;break;
      }
    }
    document.getElementById('roomLabel').textContent=label;
  }

  var clock=new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    var dt=Math.min(clock.getDelta(),.05);
    if(keys.ArrowLeft) camera.rotation.y += 1.6*dt;
    if(keys.ArrowRight) camera.rotation.y -= 1.6*dt;
    if(touchMove.active){
      camera.rotation.y -= touchMove.x*1.8*dt;
    }
    var f=0;
    if(keys.ArrowUp) f+=1;
    if(keys.ArrowDown) f-=1;
    if(touchMove.active) f += -touchMove.y;
    if(f){
      var dir=new THREE.Vector3(0,0,-1);
      dir.applyAxisAngle(new THREE.Vector3(0,1,0),camera.rotation.y);
      move(dir.x*f*player.speed*dt,dir.z*f*player.speed*dt);
    }
    camera.position.y=player.height;
    updateLabel();
    renderer.render(scene,camera);
  }

  window.addEventListener('resize',function(){
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
  });

  document.getElementById('loading').classList.add('hidden');
  animate();

} catch (err) {
  console.error(err);
  showError('Erro ao iniciar o museu 3D: ' + (err && err.message ? err.message : err));
}
})();