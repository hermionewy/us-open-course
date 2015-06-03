//Use CommonJS style via browserify to load other modules
// require("./lib/social");
// require("./lib/ads");

var three = require("three");
var tweenjs = require("tween.js");
var poiList = require("./poi");

const SKY_COLOR = 0xBBBBEE;

var nextTick = window.requestAnimationFrame ? 
  window.requestAnimationFrame.bind(window) :
  function(f) { setTimeout(f, 10) };

window.THREE = three;
var scene = new three.Scene();
scene.fog = new three.Fog(SKY_COLOR, 100, 800);

var canvas = document.querySelector(".renderer");
var renderer = new three.WebGLRenderer({
  canvas: canvas,
  alpha: false,
  antialias: true
});
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
renderer.setClearColor(SKY_COLOR);
window.addEventListener("resize", () => renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false));

var camera = new three.PerspectiveCamera(70, 16 / 9, 0.1, 1000);
camera.position.set(-100, 100, -100);

var ambience = new three.AmbientLight(0x404040);
scene.add(ambience);

var sun = new three.DirectionalLight(0x888888, 4);
sun.position.set(0, 60, 60);
scene.add(sun);

var materials = {
  white: 0x888888,
  red: 0x552222,
  gold: 0xAA8800,
  green: 0x446622
};

for (var key in materials) {
  materials[key] = new three.MeshLambertMaterial({
    color: materials[key],
    emissive: 0x222222,
    shading: three.SmoothShading,
    fog: true
  });
}

var poiMap = {};

document.body.classList.add("loading");
var init = require("./init");
init(scene, function(objects) {

  //set up remains of the scene
  var sphere = new three.SphereGeometry(1, 16, 16);
  var spike = new three.CylinderGeometry(1, 0, 10, 9, 4);
  var raycaster = new three.Raycaster();

  poiList.course.forEach(function(point) {
    point.hole = new three.Vector3(...point.hole);
    point.tee = new three.Vector3(...point.tee);

    //set hole positions, including the y from terrain
    raycaster.set(
      new three.Vector3(point.hole.x, 1000, point.hole.z),
      new three.Vector3(0, -1, 0)
    );
    var intersects = raycaster.intersectObject(objects.terrain);
    if (intersects[0]) {
      point.hole.y = (1000 - intersects[0].distance) * .1;
    }

    var ball = new three.Mesh(sphere, materials.white);
    ball.position.set(point.hole.x, point.hole.y, point.hole.z);
    scene.add(ball);

    //do the same for the tees
    raycaster.set(
      new three.Vector3(point.tee.x, 1000, point.tee.z),
      new three.Vector3(0, -1, 0)
    );
    var intersects = raycaster.intersectObject(objects.terrain);
    if (intersects[0]) {
      point.tee.y = (1000 - intersects[0].distance) * .1;
    }
    var tee = new three.Mesh(spike, materials.red);
    tee.position.set(point.tee.x, point.tee.y, point.tee.z);
    scene.add(tee);

    // ball.visible = false;
    // tee.visible = false;

    poiMap[point.id] = {
      ball: ball,
      data: point,
      tee: tee
    };
  });

  var counter = 0;
  var renderLoop = function() {
    counter += .01;
    objects.water.morphTargetInfluences[0] = Math.abs(Math.sin(counter))
    tweenjs.update();
    renderer.render(scene, camera);
    nextTick(renderLoop);
  };

  document.body.classList.remove("loading");
  renderLoop();
  goto("overview");
});

//navigation
document.body.addEventListener("click", function(e) {
  if (!e.target.classList.contains("go-to")) return;
  var id = e.target.getAttribute("data-link");
  goto(id);
});

var cameraTweens = {
  location: null,
  rotation: null
};
var previous = null;

var goto = function(id) {
  if (previous) {
    previous.ball.visible = false;
    previous.tee.visible = false;
  }

  var currentPosition = camera.position;
  var currentRotation = camera.rotation;
  var newRotation, newPosition, shot;

  if (id == "overview") {
    shot = poiList.overview;
  } else {
    var point = poiMap[id];
    shot = point.data.camera;
    point.ball.visible = true;
    point.tee.visible = true;
    previous = point;
  }
  var newPosition = new three.Vector3(...shot.location);
  var newRotation = new three.Vector3(...shot.rotation);
  
  if (cameraTweens.location) cameraTweens.location.stop();
  if (cameraTweens.rotation) cameraTweens.rotation.stop();

  var l = cameraTweens.location = new tweenjs.Tween(currentPosition).to(newPosition, 1000);
  l.easing(tweenjs.Easing.Quartic.InOut);
  l.onUpdate(function() {
    camera.position.set(this.x, this.y, this.z);
  });
  l.start();

  var r = cameraTweens.rotation = new tweenjs.Tween(currentRotation).to(newRotation, 1000);
  r.easing(tweenjs.Easing.Quartic.InOut);
  r.onUpdate(function() {
    camera.rotation.set(this.x, this.y, this.z);
  });
  r.start();

};

var current = 0;
var shift = function() {
  goto((current++ % 18) + 1);
  setTimeout(shift, 4000);
};