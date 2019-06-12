import * as THREE from "three";
import * as dat from "dat.gui";
import { klein, makeHeartShape } from "./helpers";
const geometries = {
  BoxBufferGeometry: "BoxBufferGeometry",
  BoxGeometry: "BoxGeometry",
  CylinderBufferGeometry: "CylinderBufferGeometry",
  CylinderGeometry: "CylinderGeometry",
  ConeBufferGeometry: "ConeBufferGeometry",
  ConeGeometry: "ConeGeometry",
  CircleBufferGeometry: "CircleBufferGeometry",
  CircleGeometry: "CircleGeometry",
  DodecahedronGeometry: "DodecahedronGeometry",
  DodecahedronBufferGeometry: "DodecahedronBufferGeometry",
  IcosahedronGeometry: "IcosahedronGeometry",
  IcosahedronBufferGeometry: "IcosahedronBufferGeometry",
  LatheBufferGeometry: "LatheBufferGeometry",
  LatheGeometry: "LatheGeometry",
  OctahedronGeometry: "OctahedronGeometry",
  OctahedronBufferGeometry: "OctahedronBufferGeometry",
  PlaneBufferGeometry: "PlaneBufferGeometry",
  PlaneGeometry: "PlaneGeometry",
  RingBufferGeometry: "RingBufferGeometry",
  RingGeometry: "RingGeometry",
  SphereBufferGeometry: "SphereBufferGeometry",
  SphereGeometry: "SphereGeometry",
  TetrahedronGeometry: "TetrahedronGeometry",
  TetrahedronBufferGeometry: "TetrahedronBufferGeometry",
  TextGeometry: "TextGeometry",
  TorusBufferGeometry: "TorusBufferGeometry",
  TorusGeometry: "TorusGeometry",
  TorusKnotBufferGeometry: "TorusKnotBufferGeometry",
  TorusKnotGeometry: "TorusKnotGeometry",
  ParametricBufferGeometry: "ParametricBufferGeometry",
  ParametricGeometry: "ParametricGeometry",
  TubeGeometry: "TubeGeometry",
  TubeBufferGeometry: "TubeBufferGeometry",
  ShapeGeometry: "ShapeGeometry",
  ShapeBufferGeometry: "ShapeBufferGeometry",
  ExtrudeGeometry: "ExtrudeGeometry",
  ExtrudeBufferGeometry: "ExtrudeBufferGeometry"
};
const defaultGeo = "ShapeGeometry";
const Navoptions = {
  Geometry: defaultGeo
};

const TWO_PI = Math.PI * 2;

export const GData = {
  enableNormals: false,
  pauseAnimation: false
};

/// Controls

const baseGUI = new dat.GUI({ name: "Root" });
const Scene_Select_Control = baseGUI.addFolder("Select A Scene");
const Shared_Controls = baseGUI.addFolder("Shared Controls");
const Scene_Controls = baseGUI.addFolder("Scene Controls");

Scene_Select_Control.add(Navoptions, "Geometry", geometries).onChange(function(
  v
) {
  window.location.hash = v;
});

const normsControl = Shared_Controls.add(GData, "enableNormals");
Shared_Controls.add(GData, "pauseAnimation");

const createSceneContoller = () => {
  let hasloaded = false;

  return (mesh: GeoGroup, _name?: string) => {
    normsControl.onChange(function() {
      setVisibility(mesh);
    });

    if (!hasloaded) {
      hasloaded = true;
      // lastFolder=gui.addFolder(folderName)
      return Scene_Controls;
    }

    // Manualy since dat.interal Remove throws a bug
    //@ts-ignore
    while (Scene_Controls.__ul.childNodes.length > 1) {
      //@ts-ignore
      Scene_Controls.__ul.removeChild(Scene_Controls.__ul.lastChild);
    }

    return Scene_Controls;
  };
};

const makeControlFolder = createSceneContoller();

export function setVisibility(mesh: GeoGroup) {
  if (GData.enableNormals) {
    mesh.children[0].visible = false;
    mesh.children[1].visible = false;

    mesh.children[2].visible = true;
    mesh.children[3].visible = true;
  } else {
    mesh.children[0].visible = true;
    mesh.children[1].visible = true;

    mesh.children[2].visible = false;
    mesh.children[3].visible = false;
  }
}

export interface GeoGroup extends THREE.Group {
  children: [THREE.LineSegments, THREE.Mesh, THREE.LineSegments, THREE.Mesh];
}

function updateGroupGeometry<T extends THREE.Geometry | THREE.BufferGeometry>(
  mesh: GeoGroup,
  _scene: THREE.Scene,
  geometry: T
) {
  mesh.children[0].geometry.dispose();
  mesh.children[1].geometry.dispose();
  mesh.children[2].geometry.dispose();
  mesh.children[3].geometry.dispose();

  mesh.children[0].geometry = new THREE.WireframeGeometry(geometry);
  mesh.children[1].geometry = geometry;

  mesh.children[3].geometry = geometry;
  const helper = new THREE.VertexNormalsHelper(mesh.children[3], 10);
  mesh.children[2].geometry = helper.geometry;
  mesh.children[2].material = helper.material;
}

function CustomSinCurve(scale) {
  THREE.Curve.call(this);

  this.scale = scale === undefined ? 1 : scale;
}

CustomSinCurve.prototype = Object.create(THREE.Curve.prototype);
CustomSinCurve.prototype.constructor = CustomSinCurve;

CustomSinCurve.prototype.getPoint = function(t) {
  var tx = t * 3 - 1.5;
  var ty = Math.sin(2 * Math.PI * t);
  var tz = 0;

  return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
};

// heart shape

const guis = {
  BoxBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      width: 15,
      height: 15,
      depth: 15,
      widthSegments: 1,
      heightSegments: 1,
      depthSegments: 1
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.BoxBufferGeometry(
          data.width,
          data.height,
          data.depth,
          data.widthSegments,
          data.heightSegments,
          data.depthSegments
        )
      );
    }

    const folder = makeControlFolder(mesh, "THREE.BoxBufferGeometry");

    folder.add(data, "width", 1, 30).onChange(generateGeometry);
    folder.add(data, "height", 1, 30).onChange(generateGeometry);
    folder.add(data, "depth", 1, 30).onChange(generateGeometry);
    folder
      .add(data, "widthSegments", 1, 10)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "heightSegments", 1, 10)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "depthSegments", 1, 10)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  BoxGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      width: 15,
      height: 15,
      depth: 15,
      widthSegments: 1,
      heightSegments: 1,
      depthSegments: 1
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.BoxGeometry(
          data.width,
          data.height,
          data.depth,
          data.widthSegments,
          data.heightSegments,
          data.depthSegments
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.BoxGeometry");

    folder.add(data, "width", 1, 30).onChange(generateGeometry);
    folder.add(data, "height", 1, 30).onChange(generateGeometry);
    folder.add(data, "depth", 1, 30).onChange(generateGeometry);
    folder
      .add(data, "widthSegments", 1, 10)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "heightSegments", 1, 10)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "depthSegments", 1, 10)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  CylinderBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radiusTop: 5,
      radiusBottom: 5,
      height: 10,
      radiusSegments: 8,
      heightSegments: 1,
      openEnded: false,
      thetaStart: 0,
      thetaLength: TWO_PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.CylinderBufferGeometry(
          data.radiusTop,
          data.radiusBottom,
          data.height,
          data.radiusSegments,
          data.heightSegments,
          data.openEnded,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.CylinderBufferGeometry");

    folder.add(data, "radiusTop", 0, 30).onChange(generateGeometry);
    folder.add(data, "radiusBottom", 0, 30).onChange(generateGeometry);
    folder.add(data, "height", 1, 50).onChange(generateGeometry);
    folder
      .add(data, "radiusSegments", 3, 64)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "heightSegments", 1, 64)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "openEnded").onChange(generateGeometry);
    folder.add(data, "thetaStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  CylinderGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radiusTop: 5,
      radiusBottom: 5,
      height: 10,
      radiusSegments: 8,
      heightSegments: 1,
      openEnded: false,
      thetaStart: 0,
      thetaLength: TWO_PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.CylinderGeometry(
          data.radiusTop,
          data.radiusBottom,
          data.height,
          data.radiusSegments,
          data.heightSegments,
          data.openEnded,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.CylinderGeometry");

    folder.add(data, "radiusTop", 1, 30).onChange(generateGeometry);
    folder.add(data, "radiusBottom", 1, 30).onChange(generateGeometry);
    folder.add(data, "height", 1, 50).onChange(generateGeometry);
    folder
      .add(data, "radiusSegments", 3, 64)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "heightSegments", 1, 64)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "openEnded").onChange(generateGeometry);
    folder.add(data, "thetaStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  ConeBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 5,
      height: 10,
      radiusSegments: 8,
      heightSegments: 1,
      openEnded: false,
      thetaStart: 0,
      thetaLength: TWO_PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.ConeBufferGeometry(
          data.radius,
          data.height,
          data.radiusSegments,
          data.heightSegments,
          data.openEnded,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.ConeBufferGeometry");

    folder.add(data, "radius", 0, 30).onChange(generateGeometry);
    folder.add(data, "height", 1, 50).onChange(generateGeometry);
    folder
      .add(data, "radiusSegments", 3, 64)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "heightSegments", 1, 64)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "openEnded").onChange(generateGeometry);
    folder.add(data, "thetaStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  ConeGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 5,
      height: 10,
      radiusSegments: 8,
      heightSegments: 1,
      openEnded: false,
      thetaStart: 0,
      thetaLength: TWO_PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.ConeGeometry(
          data.radius,
          data.height,
          data.radiusSegments,
          data.heightSegments,
          data.openEnded,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.ConeGeometry");

    folder.add(data, "radius", 0, 30).onChange(generateGeometry);
    folder.add(data, "height", 1, 50).onChange(generateGeometry);
    folder
      .add(data, "radiusSegments", 3, 64)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "heightSegments", 1, 64)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "openEnded").onChange(generateGeometry);
    folder.add(data, "thetaStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  CircleBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      segments: 32,
      thetaStart: 0,
      thetaLength: TWO_PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.CircleBufferGeometry(
          data.radius,
          data.segments,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.CircleBufferGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder
      .add(data, "segments", 0, 128)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "thetaStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  CircleGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      segments: 32,
      thetaStart: 0,
      thetaLength: TWO_PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.CircleGeometry(
          data.radius,
          data.segments,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.CircleGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder
      .add(data, "segments", 0, 128)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "thetaStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  DodecahedronGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      detail: 0
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.DodecahedronGeometry(data.radius, data.detail)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.DodecahedronGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder
      .add(data, "detail", 0, 5)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  DodecahedronBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      detail: 0
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.DodecahedronBufferGeometry(data.radius, data.detail)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.DodecahedronBufferGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder
      .add(data, "detail", 0, 5)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  IcosahedronGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      detail: 0
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.IcosahedronGeometry(data.radius, data.detail)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.IcosahedronGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder
      .add(data, "detail", 0, 5)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  IcosahedronBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      detail: 0
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.IcosahedronBufferGeometry(data.radius, data.detail)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.IcosahedronBufferGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder
      .add(data, "detail", 0, 5)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  LatheBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var points = [];

    for (var i = 0; i < 10; i++) {
      points.push(new THREE.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
    }

    var data = {
      segments: 12,
      phiStart: 0,
      phiLength: TWO_PI
    };

    function generateGeometry() {
      var geometry = new THREE.LatheBufferGeometry(
        points,
        data.segments,
        data.phiStart,
        data.phiLength
      );

      updateGroupGeometry(mesh, scene, geometry);
    }

    var folder = makeControlFolder(mesh, "THREE.LatheBufferGeometry");

    folder
      .add(data, "segments", 1, 30)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "phiStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "phiLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  LatheGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var points = [];

    for (var i = 0; i < 10; i++) {
      points.push(new THREE.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
    }

    var data = {
      segments: 12,
      phiStart: 0,
      phiLength: TWO_PI
    };

    function generateGeometry() {
      var geometry = new THREE.LatheGeometry(
        points,
        data.segments,
        data.phiStart,
        data.phiLength
      );

      updateGroupGeometry(mesh, scene, geometry);
    }

    var folder = makeControlFolder(mesh, "THREE.LatheGeometry");

    folder
      .add(data, "segments", 1, 30)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "phiStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "phiLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  OctahedronGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      detail: 0
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.OctahedronGeometry(data.radius, data.detail)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.OctahedronGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder
      .add(data, "detail", 0, 5)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  OctahedronBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      detail: 0
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.OctahedronBufferGeometry(data.radius, data.detail)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.OctahedronBufferGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder
      .add(data, "detail", 0, 5)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  PlaneBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      width: 10,
      height: 10,
      widthSegments: 1,
      heightSegments: 1
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.PlaneBufferGeometry(
          data.width,
          data.height,
          data.widthSegments,
          data.heightSegments
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.PlaneBufferGeometry");

    folder.add(data, "width", 1, 30).onChange(generateGeometry);
    folder.add(data, "height", 1, 30).onChange(generateGeometry);
    folder
      .add(data, "widthSegments", 1, 30)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "heightSegments", 1, 30)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  PlaneGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      width: 10,
      height: 10,
      widthSegments: 1,
      heightSegments: 1
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.PlaneGeometry(
          data.width,
          data.height,
          data.widthSegments,
          data.heightSegments
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.PlaneGeometry");

    folder.add(data, "width", 1, 30).onChange(generateGeometry);
    folder.add(data, "height", 1, 30).onChange(generateGeometry);
    folder
      .add(data, "widthSegments", 1, 30)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "heightSegments", 1, 30)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  RingBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      innerRadius: 5,
      outerRadius: 10,
      thetaSegments: 8,
      phiSegments: 8,
      thetaStart: 0,
      thetaLength: TWO_PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.RingBufferGeometry(
          data.innerRadius,
          data.outerRadius,
          data.thetaSegments,
          data.phiSegments,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.RingBufferGeometry");

    folder.add(data, "innerRadius", 1, 30).onChange(generateGeometry);
    folder.add(data, "outerRadius", 1, 30).onChange(generateGeometry);
    folder
      .add(data, "thetaSegments", 1, 30)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "phiSegments", 1, 30)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "thetaStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  RingGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      innerRadius: 5,
      outerRadius: 10,
      thetaSegments: 8,
      phiSegments: 8,
      thetaStart: 0,
      thetaLength: TWO_PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.RingGeometry(
          data.innerRadius,
          data.outerRadius,
          data.thetaSegments,
          data.phiSegments,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.RingGeometry");

    folder.add(data, "innerRadius", 1, 30).onChange(generateGeometry);
    folder.add(data, "outerRadius", 1, 30).onChange(generateGeometry);
    folder
      .add(data, "thetaSegments", 1, 30)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "phiSegments", 1, 30)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "thetaStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  SphereBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 15,
      widthSegments: 8,
      heightSegments: 6,
      phiStart: 0,
      phiLength: TWO_PI,
      thetaStart: 0,
      thetaLength: Math.PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.SphereBufferGeometry(
          data.radius,
          data.widthSegments,
          data.heightSegments,
          data.phiStart,
          data.phiLength,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.SphereBufferGeometry");

    folder.add(data, "radius", 1, 30).onChange(generateGeometry);
    folder
      .add(data, "widthSegments", 3, 32)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "heightSegments", 2, 32)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "phiStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "phiLength", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  SphereGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 15,
      widthSegments: 8,
      heightSegments: 6,
      phiStart: 0,
      phiLength: TWO_PI,
      thetaStart: 0,
      thetaLength: Math.PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.SphereGeometry(
          data.radius,
          data.widthSegments,
          data.heightSegments,
          data.phiStart,
          data.phiLength,
          data.thetaStart,
          data.thetaLength
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.SphereGeometry");

    folder.add(data, "radius", 1, 30).onChange(generateGeometry);
    folder
      .add(data, "widthSegments", 3, 32)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "heightSegments", 2, 32)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "phiStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "phiLength", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaStart", 0, TWO_PI).onChange(generateGeometry);
    folder.add(data, "thetaLength", 0, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  TetrahedronGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      detail: 0
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.TetrahedronGeometry(data.radius, data.detail)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.TetrahedronGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder
      .add(data, "detail", 0, 5)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  TetrahedronBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      detail: 0
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.TetrahedronBufferGeometry(data.radius, data.detail)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.TetrahedronBufferGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder
      .add(data, "detail", 0, 5)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  TextGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      text: "TextGeometry",
      size: 5,
      height: 2,
      curveSegments: 12,
      font: "helvetiker",
      weight: "regular",
      bevelEnabled: false,
      bevelThickness: 1,
      bevelSize: 0.5,
      bevelSegments: 3
    };

    var fonts = ["helvetiker", "optimer", "gentilis", "droid/droid_serif"];

    var weights = ["regular", "bold"];

    function generateGeometry() {
      var loader = new THREE.FontLoader();
      loader.load(
        "../../examples/fonts/" +
          data.font +
          "_" +
          data.weight +
          ".typeface.json",
        function(font) {
          var geometry = new THREE.TextGeometry(data.text, {
            font: font,
            size: data.size,
            height: data.height,
            curveSegments: data.curveSegments,
            bevelEnabled: data.bevelEnabled,
            bevelThickness: data.bevelThickness,
            bevelSize: data.bevelSize,
            bevelSegments: data.bevelSegments
          });
          geometry.center();

          updateGroupGeometry(mesh, scene, geometry);
        }
      );
    }

    //Hide the wireframe
    mesh.children[0].visible = false;

    var folder = makeControlFolder(mesh, "THREE.TextGeometry");

    folder.add(data, "text").onChange(generateGeometry);
    folder.add(data, "size", 1, 30).onChange(generateGeometry);
    folder.add(data, "height", 1, 20).onChange(generateGeometry);
    folder
      .add(data, "curveSegments", 1, 20)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "font", fonts).onChange(generateGeometry);
    folder.add(data, "weight", weights).onChange(generateGeometry);
    folder.add(data, "bevelEnabled").onChange(generateGeometry);
    folder.add(data, "bevelThickness", 0.1, 3).onChange(generateGeometry);
    folder.add(data, "bevelSize", 0.1, 3).onChange(generateGeometry);
    folder
      .add(data, "bevelSegments", 0, 8)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  TorusBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      tube: 3,
      radialSegments: 16,
      tubularSegments: 100,
      arc: TWO_PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.TorusBufferGeometry(
          data.radius,
          data.tube,
          data.radialSegments,
          data.tubularSegments,
          data.arc
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.TorusBufferGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder.add(data, "tube", 0.1, 10).onChange(generateGeometry);
    folder
      .add(data, "radialSegments", 2, 30)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "tubularSegments", 3, 200)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "arc", 0.1, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  TorusGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      tube: 3,
      radialSegments: 16,
      tubularSegments: 100,
      arc: TWO_PI
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.TorusGeometry(
          data.radius,
          data.tube,
          data.radialSegments,
          data.tubularSegments,
          data.arc
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.TorusGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder.add(data, "tube", 0.1, 10).onChange(generateGeometry);
    folder
      .add(data, "radialSegments", 2, 30)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "tubularSegments", 3, 200)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "arc", 0.1, TWO_PI).onChange(generateGeometry);

    generateGeometry();
  },

  TorusKnotBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      tube: 3,
      tubularSegments: 64,
      radialSegments: 8,
      p: 2,
      q: 3
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.TorusKnotBufferGeometry(
          data.radius,
          data.tube,
          data.tubularSegments,
          data.radialSegments,
          data.p,
          data.q
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.TorusKnotBufferGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder.add(data, "tube", 0.1, 10).onChange(generateGeometry);
    folder
      .add(data, "tubularSegments", 3, 300)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "radialSegments", 3, 20)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "p", 1, 20)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "q", 1, 20)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  TorusKnotGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      radius: 10,
      tube: 3,
      tubularSegments: 64,
      radialSegments: 8,
      p: 2,
      q: 3
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.TorusKnotGeometry(
          data.radius,
          data.tube,
          data.tubularSegments,
          data.radialSegments,
          data.p,
          data.q
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.TorusKnotGeometry");

    folder.add(data, "radius", 1, 20).onChange(generateGeometry);
    folder.add(data, "tube", 0.1, 10).onChange(generateGeometry);
    folder
      .add(data, "tubularSegments", 3, 300)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "radialSegments", 3, 20)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "p", 1, 20)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "q", 1, 20)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  ParametricBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      slices: 25,
      stacks: 25
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.ParametricBufferGeometry(klein, data.slices, data.stacks)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.ParametricBufferGeometry");

    folder
      .add(data, "slices", 1, 100)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "stacks", 1, 100)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  ParametricGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      slices: 25,
      stacks: 25
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.ParametricGeometry(klein, data.slices, data.stacks)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.ParametricGeometry");

    folder
      .add(data, "slices", 1, 100)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "stacks", 1, 100)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  TubeGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      segments: 20,
      radius: 2,
      radiusSegments: 8
    };

    var path = new CustomSinCurve(10);

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.TubeGeometry(
          path,
          data.segments,
          data.radius,
          data.radiusSegments,
          false
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.TubeGeometry");

    folder
      .add(data, "segments", 1, 100)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "radius", 1, 10).onChange(generateGeometry);
    folder
      .add(data, "radiusSegments", 1, 20)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  TubeBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      segments: 20,
      radius: 2,
      radiusSegments: 8
    };

    var path = new CustomSinCurve(10);

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.TubeBufferGeometry(
          path,
          data.segments,
          data.radius,
          data.radiusSegments,
          false
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.TubeBufferGeometry");

    folder
      .add(data, "segments", 1, 100)
      .step(1)
      .onChange(generateGeometry);
    folder.add(data, "radius", 1, 10).onChange(generateGeometry);
    folder
      .add(data, "radiusSegments", 1, 20)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  ShapeGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      segments: 12,
      x: 0,
      y: 0
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.ShapeGeometry(makeHeartShape(data.x, data.y), data.segments)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.ShapeGeometry");
    folder
      .add(data, "segments", 1, 100)
      .step(1)
      .onChange(generateGeometry);

    folder.add(data, "x", -20, 20).onChange(generateGeometry);
    folder.add(data, "y", -20, 20).onChange(generateGeometry);
    generateGeometry();
  },

  ShapeBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      segments: 12,
      x: 0,
      y: 0
    };

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.ShapeBufferGeometry(
          makeHeartShape(data.x, data.y),
          data.segments
        )
      );
    }

    var folder = makeControlFolder(mesh, "THREE.ShapeBufferGeometry");
    folder
      .add(data, "segments", 1, 100)
      .step(1)
      .onChange(generateGeometry);

    folder.add(data, "x", -20, 20);
    folder.add(data, "y", -20, 20);
    generateGeometry();
  },

  ExtrudeGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      steps: 2,
      amount: 16,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 1
    };

    var length = 12,
      width = 8;

    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, width);
    shape.lineTo(length, width);
    shape.lineTo(length, 0);
    shape.lineTo(0, 0);

    function generateGeometry() {
      updateGroupGeometry(mesh, scene, new THREE.ExtrudeGeometry(shape, data));
    }

    var folder = makeControlFolder(mesh, "THREE.ExtrudeGeometry");

    folder
      .add(data, "steps", 1, 10)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "amount", 1, 20)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "bevelThickness", 1, 5)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "bevelSize", 1, 5)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "bevelSegments", 1, 5)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  },

  ExtrudeBufferGeometry: function(mesh: GeoGroup, scene: THREE.Scene) {
    var data = {
      steps: 2,
      amount: 16,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 1
    };

    var length = 12,
      width = 8;

    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, width);
    shape.lineTo(length, width);
    shape.lineTo(length, 0);
    shape.lineTo(0, 0);

    function generateGeometry() {
      updateGroupGeometry(
        mesh,
        scene,
        new THREE.ExtrudeBufferGeometry(shape, data)
      );
    }

    var folder = makeControlFolder(mesh, "THREE.ExtrudeBufferGeometry");

    folder
      .add(data, "steps", 1, 10)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "amount", 1, 20)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "bevelThickness", 1, 5)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "bevelSize", 1, 5)
      .step(1)
      .onChange(generateGeometry);
    folder
      .add(data, "bevelSegments", 1, 5)
      .step(1)
      .onChange(generateGeometry);

    generateGeometry();
  }
};

export function chooseFromHash(mesh: GeoGroup, scene: THREE.Scene) {
  const selectedGeometry = window.location.hash.substring(1) || defaultGeo;

  if (guis[selectedGeometry] !== undefined) {
    guis[selectedGeometry](mesh, scene);
  }

  if (selectedGeometry === "TextGeometry") {
    return { fixed: true };
  }

  //No configuration options
  return {};
}

// console.log(
//     JSON.stringify(

//     Object.keys(guis).reduce((acc,k)=>({...acc, [k]:k} ),{} )))
