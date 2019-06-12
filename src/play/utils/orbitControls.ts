import * as THREE from "three";
import { MOUSE } from "three";
const STATE = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_DOLLY_PAN: 4
};

export class OrbitControls extends THREE.EventDispatcher {
  object: any;
  domElement: any;
  enabled = true;
  target = new THREE.Vector3();
  minDistance = 0;
  maxDistance = Infinity;
  minZoom = 0;
  maxZoom = Infinity;
  minPolarAngle = 0;
  maxPolarAngle = Math.PI;
  minAzimuthAngle = -Infinity;
  maxAzimuthAngle = Infinity;
  enableDamping = false;
  dampingFactor = 0.25;
  enableZoom = true;
  zoomSpeed = 1.0;
  enableRotate = true;
  rotateSpeed = 1.0;
  enablePan = true;
  panSpeed = 1.0;
  screenSpacePanning = false;
  keyPanSpeed = 7.0;
  autoRotate = false;
  autoRotateSpeed = 2.0;
  enableKeys = true;
  keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
  mouseButtons = {
    LEFT: MOUSE.LEFT,
    MIDDLE: MOUSE.MIDDLE,
    RIGHT: MOUSE.RIGHT
  };
  target0: any;
  position0: any;
  zoom0: any;

  private changeEvent = { type: "change" };
  private startEvent = { type: "start" };
  private endEvent = { type: "end" };
  private state = STATE.NONE;
  private EPS = 0.000001;
  private spherical = new THREE.Spherical();
  private sphericalDelta = new THREE.Spherical();
  private scale = 1;
  private panOffset = new THREE.Vector3();
  private zoomChanged = false;
  private rotateStart = new THREE.Vector2();
  private rotateEnd = new THREE.Vector2();
  private rotateDelta = new THREE.Vector2();
  private panStart = new THREE.Vector2();
  private panEnd = new THREE.Vector2();
  private panDelta = new THREE.Vector2();
  private dollyStart = new THREE.Vector2();
  private dollyEnd = new THREE.Vector2();
  private dollyDelta = new THREE.Vector2();

  private offset = new THREE.Vector3();
  private quat: any;
  private quatInverse: any;
  private lastPosition = new THREE.Vector3();
  private lastQuaternion = new THREE.Quaternion();
  private panLeftV = new THREE.Vector3();
  private panUpV = new THREE.Vector3();
  private panOffsetV = new THREE.Vector3();

  constructor(object: any, domElement?: any) {
    super();
    this.object = object;
    this.domElement = domElement !== undefined ? domElement : document;
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;
    this.quat = new THREE.Quaternion().setFromUnitVectors(
      this.object.up,
      new THREE.Vector3(0, 1, 0)
    );
    this.quatInverse = this.quat.clone().inverse();
    this.domElement.addEventListener(
      "contextmenu",
      this.onContextMenu.bind(this),
      false
    );
    this.domElement.addEventListener(
      "mousedown",
      this.onMouseDown.bind(this),
      false
    );
    this.domElement.addEventListener(
      "wheel",
      this.onMouseWheel.bind(this),
      false
    );
    this.domElement.addEventListener(
      "touchstart",
      this.onTouchStart.bind(this),
      false
    );
    this.domElement.addEventListener(
      "touchend",
      this.onTouchEnd.bind(this),
      false
    );
    this.domElement.addEventListener(
      "touchmove",
      this.onTouchMove.bind(this),
      false
    );
    window.addEventListener("keydown", this.onKeyDown.bind(this), false);

    // force an update at start

    this.update();
  }

  getPolarAngle() {
    return this.spherical.phi;
  }

  getAzimuthalAngle() {
    return this.spherical.theta;
  }

  saveState() {
    this.target0.copy(this.target);
    this.position0.copy(this.object.position);
    this.zoom0 = this.object.zoom;
  }

  reset() {
    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    this.object.zoom = this.zoom0;
    this.object.updateProjectionMatrix();
    this.dispatchEvent(this.changeEvent);
    this.update();
    this.state = STATE.NONE;
  }

  update() {
    var position = this.object.position;
    this.offset.copy(position).sub(this.target);
    this.offset.applyQuaternion(this.quat);
    this.spherical.setFromVector3(this.offset);
    if (this.autoRotate && this.state === STATE.NONE) {
      this.rotateLeft(this.getAutoRotationAngle());
    }
    this.spherical.theta += this.sphericalDelta.theta;
    this.spherical.phi += this.sphericalDelta.phi;
    this.spherical.theta = Math.max(
      this.minAzimuthAngle,
      Math.min(this.maxAzimuthAngle, this.spherical.theta)
    );
    this.spherical.phi = Math.max(
      this.minPolarAngle,
      Math.min(this.maxPolarAngle, this.spherical.phi)
    );
    this.spherical.makeSafe();
    this.spherical.radius *= this.scale;
    this.spherical.radius = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.spherical.radius)
    );
    this.target.add(this.panOffset);
    this.offset.setFromSpherical(this.spherical);
    this.offset.applyQuaternion(this.quatInverse);
    position.copy(this.target).add(this.offset);
    this.object.lookAt(this.target);
    if (this.enableDamping === true) {
      this.sphericalDelta.theta *= 1 - this.dampingFactor;
      this.sphericalDelta.phi *= 1 - this.dampingFactor;
      this.panOffset.multiplyScalar(1 - this.dampingFactor);
    } else {
      this.sphericalDelta.set(0, 0, 0);
      this.panOffset.set(0, 0, 0);
    }
    this.scale = 1;
    if (
      this.zoomChanged ||
      this.lastPosition.distanceToSquared(this.object.position) > this.EPS ||
      8 * (1 - this.lastQuaternion.dot(this.object.quaternion)) > this.EPS
    ) {
      this.dispatchEvent(this.changeEvent);
      this.lastPosition.copy(this.object.position);
      this.lastQuaternion.copy(this.object.quaternion);
      this.zoomChanged = false;
      return true;
    }
    return false;
  }

  dispose() {
    this.domElement.removeEventListener(
      "contextmenu",
      this.onContextMenu,
      false
    );
    this.domElement.removeEventListener("mousedown", this.onMouseDown, false);
    this.domElement.removeEventListener("wheel", this.onMouseWheel, false);
    this.domElement.removeEventListener("touchstart", this.onTouchStart, false);
    this.domElement.removeEventListener("touchend", this.onTouchEnd, false);
    this.domElement.removeEventListener("touchmove", this.onTouchMove, false);
    document.removeEventListener("mousemove", this.onMouseMove, false);
    document.removeEventListener("mouseup", this.onMouseUp, false);
    window.removeEventListener("keydown", this.onKeyDown, false);
  }

  getAutoRotationAngle() {
    return ((2 * Math.PI) / 60 / 60) * this.autoRotateSpeed;
  }

  getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed);
  }

  rotateLeft(angle: any) {
    this.sphericalDelta.theta -= angle;
  }

  rotateUp(angle: any) {
    this.sphericalDelta.phi -= angle;
  }

  panLeft(distance: any, objectMatrix: any) {
    this.panLeftV.setFromMatrixColumn(objectMatrix, 0);
    this.panLeftV.multiplyScalar(-distance);
    this.panOffset.add(this.panLeftV);
  }

  panUp(distance: any, objectMatrix: any) {
    if (this.screenSpacePanning === true) {
      this.panUpV.setFromMatrixColumn(objectMatrix, 1);
    } else {
      this.panUpV.setFromMatrixColumn(objectMatrix, 0);
      this.panUpV.crossVectors(this.object.up, this.panUpV);
    }
    this.panUpV.multiplyScalar(distance);
    this.panOffset.add(this.panUpV);
  }

  pan(deltaX: any, deltaY: any) {
    let element =
      this.domElement === document ? this.domElement.body : this.domElement;
    if (this.object.isPerspectiveCamera) {
      this.panOffsetV.copy(this.object.position).sub(this.target);
      let targetDistance = this.panOffsetV.length();
      targetDistance *= Math.tan(((this.object.fov / 2) * Math.PI) / 180.0);
      this.panLeft(
        (2 * deltaX * targetDistance) / element.clientHeight,
        this.object.matrix
      );
      this.panUp(
        (2 * deltaY * targetDistance) / element.clientHeight,
        this.object.matrix
      );
    } else if (this.object.isOrthographicCamera) {
      this.panLeft(
        (deltaX * (this.object.right - this.object.left)) /
          this.object.zoom /
          element.clientWidth,
        this.object.matrix
      );
      this.panUp(
        (deltaY * (this.object.top - this.object.bottom)) /
          this.object.zoom /
          element.clientHeight,
        this.object.matrix
      );
    } else {
      console.warn(
        "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."
      );
      this.enablePan = false;
    }
  }

  dollyIn(dollyScale: any) {
    if (this.object.isPerspectiveCamera) {
      this.scale /= dollyScale;
    } else if (this.object.isOrthographicCamera) {
      this.object.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.object.zoom * dollyScale)
      );
      this.object.updateProjectionMatrix();
      this.zoomChanged = true;
    } else {
      console.warn(
        "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
      );
      this.enableZoom = false;
    }
  }

  dollyOut(dollyScale: any) {
    if (this.object.isPerspectiveCamera) {
      this.scale *= dollyScale;
    } else if (this.object.isOrthographicCamera) {
      this.object.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.object.zoom / dollyScale)
      );
      this.object.updateProjectionMatrix();
      this.zoomChanged = true;
    } else {
      console.warn(
        "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
      );
      this.enableZoom = false;
    }
  }

  handleMouseDownRotate(event: any) {
    this.rotateStart.set(event.clientX, event.clientY);
  }

  handleMouseDownDolly(event: any) {
    this.dollyStart.set(event.clientX, event.clientY);
  }

  handleMouseDownPan(event: any) {
    this.panStart.set(event.clientX, event.clientY);
  }

  handleMouseMoveRotate(event: any) {
    this.rotateEnd.set(event.clientX, event.clientY);

    this.rotateDelta
      .subVectors(this.rotateEnd, this.rotateStart)
      .multiplyScalar(this.rotateSpeed);

    var element =
      this.domElement === document ? this.domElement.body : this.domElement;

    this.rotateLeft((2 * Math.PI * this.rotateDelta.x) / element.clientHeight); // yes, height

    this.rotateUp((2 * Math.PI * this.rotateDelta.y) / element.clientHeight);

    this.rotateStart.copy(this.rotateEnd);

    this.update();
  }

  handleMouseMoveDolly(event: any) {
    this.dollyEnd.set(event.clientX, event.clientY);

    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

    if (this.dollyDelta.y > 0) {
      this.dollyIn(this.getZoomScale());
    } else if (this.dollyDelta.y < 0) {
      this.dollyOut(this.getZoomScale());
    }

    this.dollyStart.copy(this.dollyEnd);

    this.update();
  }

  handleMouseMovePan(event: any) {
    //console.log( 'handleMouseMovePan' );

    this.panEnd.set(event.clientX, event.clientY);

    this.panDelta
      .subVectors(this.panEnd, this.panStart)
      .multiplyScalar(this.panSpeed);

    this.pan(this.panDelta.x, this.panDelta.y);

    this.panStart.copy(this.panEnd);

    this.update();
  }

  handleMouseUp(event: any) {
    // console.log( 'handleMouseUp' );
  }

  handleMouseWheel(event: any) {
    // console.log( 'handleMouseWheel' );

    if (event.deltaY < 0) {
      this.dollyOut(this.getZoomScale());
    } else if (event.deltaY > 0) {
      this.dollyIn(this.getZoomScale());
    }

    this.update();
  }

  handleKeyDown(event: any) {
    // console.log( 'handleKeyDown' );

    var needsUpdate = false;

    switch (event.keyCode) {
      case this.keys.UP:
        this.pan(0, this.keyPanSpeed);
        needsUpdate = true;
        break;

      case this.keys.BOTTOM:
        this.pan(0, -this.keyPanSpeed);
        needsUpdate = true;
        break;

      case this.keys.LEFT:
        this.pan(this.keyPanSpeed, 0);
        needsUpdate = true;
        break;

      case this.keys.RIGHT:
        this.pan(-this.keyPanSpeed, 0);
        needsUpdate = true;
        break;
    }

    if (needsUpdate) {
      // prevent the browser from scrolling on cursor keys
      event.preventDefault();

      this.update();
    }
  }

  handleTouchStartRotate(event: any) {
    this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
  }

  handleTouchStartDollyPan(event: any) {
    //console.log( 'handleTouchStartDollyPan' );

    if (this.enableZoom) {
      var dx = event.touches[0].pageX - event.touches[1].pageX;
      var dy = event.touches[0].pageY - event.touches[1].pageY;

      var distance = Math.sqrt(dx * dx + dy * dy);

      this.dollyStart.set(0, distance);
    }

    if (this.enablePan) {
      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

      this.panStart.set(x, y);
    }
  }

  handleTouchMoveRotate(event: any) {
    //console.log( 'handleTouchMoveRotate' );

    this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);

    this.rotateDelta
      .subVectors(this.rotateEnd, this.rotateStart)
      .multiplyScalar(this.rotateSpeed);

    var element =
      this.domElement === document ? this.domElement.body : this.domElement;

    this.rotateLeft((2 * Math.PI * this.rotateDelta.x) / element.clientHeight); // yes, height

    this.rotateUp((2 * Math.PI * this.rotateDelta.y) / element.clientHeight);

    this.rotateStart.copy(this.rotateEnd);

    this.update();
  }

  handleTouchMoveDollyPan(event: any) {
    //console.log( 'handleTouchMoveDollyPan' );

    if (this.enableZoom) {
      var dx = event.touches[0].pageX - event.touches[1].pageX;
      var dy = event.touches[0].pageY - event.touches[1].pageY;

      var distance = Math.sqrt(dx * dx + dy * dy);

      this.dollyEnd.set(0, distance);

      this.dollyDelta.set(
        0,
        Math.pow(this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed)
      );

      this.dollyIn(this.dollyDelta.y);

      this.dollyStart.copy(this.dollyEnd);
    }

    if (this.enablePan) {
      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

      this.panEnd.set(x, y);

      this.panDelta
        .subVectors(this.panEnd, this.panStart)
        .multiplyScalar(this.panSpeed);

      this.pan(this.panDelta.x, this.panDelta.y);

      this.panStart.copy(this.panEnd);
    }

    this.update();
  }

  handleTouchEnd(event: any) {
    //console.log( 'handleTouchEnd' );
  }

  //
  // event handlers - FSM: listen for events and reset state
  //

  onMouseDown(event: any) {
    if (this.enabled === false) return;

    // Prevent the browser from scrolling.

    event.preventDefault();

    // Manually set the focus since calling preventDefault above
    // prevents the browser from setting it automatically.

    this.domElement.focus ? this.domElement.focus() : window.focus();

    switch (event.button) {
      case this.mouseButtons.LEFT:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enablePan === false) return;

          this.handleMouseDownPan(event);

          this.state = STATE.PAN;
        } else {
          if (this.enableRotate === false) return;

          this.handleMouseDownRotate(event);

          this.state = STATE.ROTATE;
        }

        break;

      case this.mouseButtons.MIDDLE:
        if (this.enableZoom === false) return;

        this.handleMouseDownDolly(event);

        this.state = STATE.DOLLY;

        break;

      case this.mouseButtons.RIGHT:
        if (this.enablePan === false) return;

        this.handleMouseDownPan(event);

        this.state = STATE.PAN;

        break;
    }

    if (this.state !== STATE.NONE) {
      document.addEventListener(
        "mousemove",
        this.onMouseMove.bind(this),
        false
      );
      document.addEventListener("mouseup", this.onMouseUp.bind(this), false);

      this.dispatchEvent(this.startEvent);
    }
  }

  onMouseMove(event: any) {
    if (this.enabled === false) return;

    event.preventDefault();

    switch (this.state) {
      case STATE.ROTATE:
        if (this.enableRotate === false) return;

        this.handleMouseMoveRotate(event);

        break;

      case STATE.DOLLY:
        if (this.enableZoom === false) return;

        this.handleMouseMoveDolly(event);

        break;

      case STATE.PAN:
        if (this.enablePan === false) return;

        this.handleMouseMovePan(event);

        break;
    }
  }

  onMouseUp(event: any) {
    if (this.enabled === false) return;

    this.handleMouseUp(event);

    document.removeEventListener("mousemove", this.onMouseMove, false);
    document.removeEventListener("mouseup", this.onMouseUp, false);

    this.dispatchEvent(this.endEvent);

    this.state = STATE.NONE;
  }

  onMouseWheel(event: any) {
    if (
      this.enabled === false ||
      this.enableZoom === false ||
      (this.state !== STATE.NONE && this.state !== STATE.ROTATE)
    )
      return;

    event.preventDefault();
    event.stopPropagation();

    this.dispatchEvent(this.startEvent);

    this.handleMouseWheel(event);

    this.dispatchEvent(this.endEvent);
  }

  onKeyDown(event: any) {
    if (
      this.enabled === false ||
      this.enableKeys === false ||
      this.enablePan === false
    )
      return;

    this.handleKeyDown(event);
  }

  onTouchStart(event: any) {
    if (this.enabled === false) return;

    event.preventDefault();

    switch (event.touches.length) {
      case 1: // one-fingered touch: rotate
        if (this.enableRotate === false) return;

        this.handleTouchStartRotate(event);

        this.state = STATE.TOUCH_ROTATE;

        break;

      case 2: // two-fingered touch: dolly-pan
        if (this.enableZoom === false && this.enablePan === false) return;

        this.handleTouchStartDollyPan(event);

        this.state = STATE.TOUCH_DOLLY_PAN;

        break;

      default:
        this.state = STATE.NONE;
    }

    if (this.state !== STATE.NONE) {
      this.dispatchEvent(this.startEvent);
    }
  }

  onTouchMove(event: any) {
    if (this.enabled === false) return;

    event.preventDefault();
    event.stopPropagation();

    switch (event.touches.length) {
      case 1: // one-fingered touch: rotate
        if (this.enableRotate === false) return;
        if (this.state !== STATE.TOUCH_ROTATE) return; // is this needed?

        this.handleTouchMoveRotate(event);

        break;

      case 2: // two-fingered touch: dolly-pan
        if (this.enableZoom === false && this.enablePan === false) return;
        if (this.state !== STATE.TOUCH_DOLLY_PAN) return; // is this needed?

        this.handleTouchMoveDollyPan(event);

        break;

      default:
        this.state = STATE.NONE;
    }
  }

  onTouchEnd(event: any) {
    if (this.enabled === false) return;

    this.handleTouchEnd(event);

    this.dispatchEvent(this.endEvent);

    this.state = STATE.NONE;
  }

  onContextMenu(event: any) {
    if (this.enabled === false) return;
    event.preventDefault();
  }
}
