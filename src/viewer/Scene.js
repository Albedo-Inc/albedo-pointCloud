import * as THREE from '../../libs/three.js/build/three.module.js';
import { CameraMode } from '../defines.js';
import { View } from './View.js';
import { Utils } from '../utils.js';
import { EventDispatcher } from '../EventDispatcher.js';
import { Annotation } from '../Annotation.js';

export class Scene extends EventDispatcher {
	constructor() {
		super();

		this.annotations = new Annotation();

		this.scene = new THREE.Scene();
		this.sceneBG = new THREE.Scene();
		this.scenePointCloud = new THREE.Scene();

		this.cameraP = new THREE.PerspectiveCamera(this.fov, 1, 0.1, 1000 * 1000);
		this.cameraO = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000 * 1000);
		this.cameraVR = new THREE.PerspectiveCamera();
		this.cameraBG = new THREE.Camera();
		this.cameraScreenSpace = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
		this.cameraMode = CameraMode.PERSPECTIVE;
		this.overrideCamera = null;
		this.pointclouds = [];

		this.measurements = [];
		this.profiles = [];
		this.volumes = [];
		this.polygonClipVolumes = [];
		this.cameraAnimations = [];
		this.orientedImages = [];
		this.images360 = [];
		this.geopackages = [];

		this.fpControls = null;
		this.orbitControls = null;
		this.earthControls = null;
		this.geoControls = null;
		this.deviceControls = null;
		this.inputHandler = null;

		this.view = new View();

		this.directionalLight = null;

		this.initialize();
	}

	estimateHeightAt(position) {
		let height = null;
		let fromSpacing = Infinity;

		for (let pointcloud of this.pointclouds) {
			if (pointcloud.root.geometryNode === undefined) {
				continue;
			}

			let pHeight = null;
			let pFromSpacing = Infinity;

			let lpos = position.clone().sub(pointcloud.position);
			lpos.z = 0;
			let ray = new THREE.Ray(lpos, new THREE.Vector3(0, 0, 1));

			let stack = [pointcloud.root];
			while (stack.length > 0) {
				let node = stack.pop();
				let box = node.getBoundingBox();

				let inside = ray.intersectBox(box);

				if (!inside) {
					continue;
				}

				let h =
					node.geometryNode.mean.z + pointcloud.position.z + node.geometryNode.boundingBox.min.z;

				if (node.geometryNode.spacing <= pFromSpacing) {
					pHeight = h;
					pFromSpacing = node.geometryNode.spacing;
				}

				for (let index of Object.keys(node.children)) {
					let child = node.children[index];
					if (child.geometryNode) {
						stack.push(node.children[index]);
					}
				}
			}

			if (height === null || pFromSpacing < fromSpacing) {
				height = pHeight;
				fromSpacing = pFromSpacing;
			}
		}

		return height;
	}

	getBoundingBox(pointclouds = this.pointclouds) {
		let box = new THREE.Box3();

		this.scenePointCloud.updateMatrixWorld(true);
		this.referenceFrame.updateMatrixWorld(true);

		for (let pointcloud of pointclouds) {
			pointcloud.updateMatrixWorld(true);

			let pointcloudBox = pointcloud.pcoGeometry.tightBoundingBox
				? pointcloud.pcoGeometry.tightBoundingBox
				: pointcloud.boundingBox;
			let boxWorld = Utils.computeTransformedBoundingBox(pointcloudBox, pointcloud.matrixWorld);
			box.union(boxWorld);
		}

		return box;
	}

	addPointCloud(pointcloud) {
		this.pointclouds.push(pointcloud);
		this.scenePointCloud.add(pointcloud);

		this.dispatchEvent({
			type: 'pointcloud_added',
			pointcloud: pointcloud,
		});
	}

	getActiveCamera() {
		if (this.overrideCamera) {
			return this.overrideCamera;
		}

		if (this.cameraMode === CameraMode.PERSPECTIVE) {
			return this.cameraP;
		} else if (this.cameraMode === CameraMode.ORTHOGRAPHIC) {
			return this.cameraO;
		} else if (this.cameraMode === CameraMode.VR) {
			return this.cameraVR;
		}

		return null;
	}

	initialize() {
		this.referenceFrame = new THREE.Object3D();
		this.referenceFrame.matrixAutoUpdate = false;
		this.scenePointCloud.add(this.referenceFrame);

		this.cameraP.up.set(0, 0, 1);
		this.cameraP.position.set(1000, 1000, 1000);
		this.cameraO.up.set(0, 0, 1);
		this.cameraO.position.set(1000, 1000, 1000);
		//this.camera.rotation.y = -Math.PI / 4;
		//this.camera.rotation.x = -Math.PI / 6;
		this.cameraScreenSpace.lookAt(
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0, -1),
			new THREE.Vector3(0, 1, 0)
		);

		this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		this.directionalLight.position.set(10, 10, 10);
		this.directionalLight.lookAt(new THREE.Vector3(0, 0, 0));
		this.scenePointCloud.add(this.directionalLight);

		let light = new THREE.AmbientLight(0x555555); // soft white light
		this.scenePointCloud.add(light);

		{
			// background
			let texture = Utils.createBackgroundTexture(512, 512);

			texture.minFilter = texture.magFilter = THREE.NearestFilter;
			texture.minFilter = texture.magFilter = THREE.LinearFilter;
			let bg = new THREE.Mesh(
				new THREE.PlaneBufferGeometry(2, 2, 1),
				new THREE.MeshBasicMaterial({
					map: texture,
				})
			);
			bg.material.depthTest = false;
			bg.material.depthWrite = false;
			this.sceneBG.add(bg);
		}

		// { // lights
		// 	{
		// 		let light = new THREE.DirectionalLight(0xffffff);
		// 		light.position.set(10, 10, 1);
		// 		light.target.position.set(0, 0, 0);
		// 		this.scene.add(light);
		// 	}

		// 	{
		// 		let light = new THREE.DirectionalLight(0xffffff);
		// 		light.position.set(-10, 10, 1);
		// 		light.target.position.set(0, 0, 0);
		// 		this.scene.add(light);
		// 	}

		// 	{
		// 		let light = new THREE.DirectionalLight(0xffffff);
		// 		light.position.set(0, -10, 20);
		// 		light.target.position.set(0, 0, 0);
		// 		this.scene.add(light);
		// 	}
		// }
	}

	addAnnotation(position, args = {}) {
		if (position instanceof Array) {
			args.position = new THREE.Vector3().fromArray(position);
		} else if (position.x != null) {
			args.position = position;
		}
		let annotation = new Annotation(args);
		this.annotations.add(annotation);

		return annotation;
	}

	getAnnotations() {
		return this.annotations;
	}

	removeAnnotation(annotationToRemove) {
		this.annotations.remove(annotationToRemove);
	}

	addOrientedImages(images) {
		this.orientedImages.push(images);
		this.scene.add(images.node);

		this.dispatchEvent({
			type: 'oriented_images_added',
			scene: this,
			images: images,
		});
	}

	removeOrientedImages(images) {
		let index = this.orientedImages.indexOf(images);
		if (index > -1) {
			this.orientedImages.splice(index, 1);

			this.dispatchEvent({
				type: 'oriented_images_removed',
				scene: this,
				images: images,
			});
		}
	}
}
