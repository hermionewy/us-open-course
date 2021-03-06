var three = require("three");
var poiList = require("./poi");

var util = require("./util");

module.exports = function(scene) {
  //set up remains of the scene
  var sphere = new three.SphereGeometry(util.inInches(.84), 16, 16);
  var white = new three.MeshLambertMaterial({
    color: 0x888888,
    emissive: 0x444444
  });
  var flag = require("./flag");
  var red = new three.MeshLambertMaterial({
    color: 0x772110,
    emissive: 0x440000
  });

  var poiMap = {
    overview: poiList.overview
  };

  poiList.course.forEach(function(point) {
    point.hole = new three.Vector3(...point.hole);
    point.tee = new three.Vector3(...point.tee);
    if (point.camera.tour) {
      point.camera.tour = point.camera.tour.map(p => new three.Vector3(p[0], p[1], p[2]));
    }

    var ball = new three.Mesh(sphere, white);
    ball.position.set(point.tee.x, point.tee.y + 2, point.tee.z);
    scene.add(ball);

    var hole = new three.Mesh(flag, red);
    var resize = util.inFeet(7) / 10;
    hole.scale.set(resize, resize, resize);
    hole.position.set(point.hole.x, point.hole.y + .25, point.hole.z);
    hole.rotation.set(0, Math.PI * Math.random(), 0);
    scene.add(hole);

    // ball.visible = false;
    // hole.visible = false;

    poiMap[point.id] = {
      hole: hole,
      data: point,
      tee: ball
    };
  });

  return poiMap;
}