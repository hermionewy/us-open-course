var three = require("three");

module.exports = function(scene) {
  var ambience = new three.AmbientLight(0x404040);
  scene.add(ambience);

  var sun = new three.DirectionalLight(0x888888, 4);
  sun.position.set(0, 60, 60);
  scene.add(sun);

  //create the water
  var plane = new three.PlaneGeometry(200, 550, 60, 120);
  var blue = new three.MeshPhongMaterial({
    // wireframe: true,
    color: 0x3366,
    specular: 0xFFFFFF,
    // shading: three.FlatShading,
    // shininess: 100,
    morphTargets: true
  });
  var morphs = [];
  var waveHeight = .2;
  plane.vertices.forEach(function(vertex, i) {
    vertex.z = Math.sin(i) * waveHeight
    var morphed = vertex.clone();
    morphed.z = Math.cos(i) * waveHeight;
    morphs.push(morphed);
  });
  plane.computeVertexNormals();
  plane.morphTargets.push({ name: "morph", vertices: morphs });
  var water = new three.Mesh(plane, blue);
  window.water = water;
  water.rotation.x = -Math.PI * .5;
  water.position.set(-160, 1.5, -70);
  var waves = new three.MorphAnimation(water);
  waves.play();
  scene.add(water);
};