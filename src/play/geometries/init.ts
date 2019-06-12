import * as THREE from "three";
import { chooseFromHash, GData, GeoGroup, setVisibility } from "./geos";
import { OrbitControls } from "../utils/orbitControls";
import { Stats } from "../utils/stats";

function geHTML() {
  return `
      <style>

			body {
				margin:0;
				font-size: 15px;
				line-height: 18px;
				overflow: hidden;
			}
			canvas { width: 100%; height: 100% }
			#newWindow {
				display: block;
				position: absolute;
				bottom: 0.3em;
				left: 0.5em;
				color: #fff;
			}
    </style>

    <div id="viewer" ></div>
		
   
  `;
}

document.getElementById("app").innerHTML += geHTML();
var viewer = document.getElementById("viewer");
var stats = new Stats();
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  50
);
camera.position.z = 30;
viewer.appendChild(renderer.domElement);
viewer.appendChild(stats.dom);
var orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableZoom = false;
var lights = [];
lights[0] = new THREE.PointLight(0xffffff, 1, 0);
lights[1] = new THREE.PointLight(0xffffff, 1, 0);
lights[2] = new THREE.PointLight(0xffffff, 1, 0);
lights[0].position.set(0, 200, 0);
lights[1].position.set(100, 200, 100);
lights[2].position.set(-100, -200, -100);
var scene = new THREE.Scene();

scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);

const makeEmptyGeoGroup = () => new THREE.Group() as GeoGroup;
let mesh = makeEmptyGeoGroup();

const createBaseMesh = () => {
  return new THREE.Mesh(
    new THREE.Geometry(),
    new THREE.MeshPhongMaterial({
      color: 0x156289,
      emissive: 0x072534,
      side: THREE.DoubleSide
    })
  );
};

const createBaseLines = () => {
  return new THREE.LineSegments(
    new THREE.Geometry(),
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5
    })
  );
};

const createNormalsMesh = () => {
  return new THREE.Mesh(
    new THREE.Geometry(),
    new THREE.MeshBasicMaterial({
      color: 0xfefefe,
      wireframe: true,
      opacity: 0.5
    })
  );
};

const createNormalsLines = () => {
  return new THREE.LineSegments(
    new THREE.Geometry(),
    new THREE.LineBasicMaterial({
      color: 0xfefefe,
      opacity: 0.5
    })
  );
};

const initiateGroup = () => {
  mesh.add(createBaseLines());
  mesh.add(createBaseMesh());
  mesh.add(createNormalsLines());
  mesh.add(createNormalsMesh());
};

var isFixed = false;

const init = (addToScene = true) => {
  initiateGroup();
  setVisibility(mesh);
  const { fixed } = chooseFromHash(mesh, scene);
  isFixed = fixed;

  if (addToScene) {
    scene.add(mesh);
  }
};

const render = function() {
  requestAnimationFrame(render);
  if (!isFixed && !GData.pauseAnimation) {
    //.add({x:.005,y:.005,z:0} as any)
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.005;
  }

  renderer.render(scene, camera);
  stats.update();
};

window.addEventListener(
  "hashchange",
  function() {
    scene.remove(mesh);
    mesh = makeEmptyGeoGroup();
    init();
  },
  false
);

window.addEventListener(
  "resize",
  function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

init();
render();
