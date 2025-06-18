import * as THREE from 'three';

declare namespace Potree {
	// 基础类型定义
	interface PointCloudOptions {
		pointBudget?: number;
		fov?: number;
		edlEnabled?: boolean;
		edlRadius?: number;
		edlStrength?: number;
		edlOpacity?: number;
		minNodeSize?: number;
		showBoundingBox?: boolean;
	}

	interface CameraPositionOptions {
		position?: THREE.Vector3;
		target?: THREE.Vector3;
		duration?: number;
		animate?: boolean;
	}

	// 主要类定义
	class Viewer {
		constructor(element: HTMLElement, options?: PointCloudOptions);

		scene: Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;

		loadPointCloud(url: string): Promise<PointCloudOctree>;
		autoPositionCamera(pointcloud: PointCloudOctree, options?: CameraPositionOptions): void;
		resetCameraToPointClouds(options?: CameraPositionOptions): void;
		focusOnPointCloud(name: string, options?: CameraPositionOptions): void;

		setPointBudget(budget: number): void;
		setFOV(fov: number): void;
		setEDLEnabled(enabled: boolean): void;
		setEDLRadius(radius: number): void;
		setEDLStrength(strength: number): void;
		setEDLOpacity(opacity: number): void;

		dispose(): void;
	}

	class Scene extends THREE.Scene {
		pointclouds: PointCloudOctree[];
		addPointCloud(pointcloud: PointCloudOctree): void;
		removePointCloud(pointcloud: PointCloudOctree): void;
	}

	class PointCloudOctree extends THREE.Object3D {
		name: string;
		url: string;
		pointBudget: number;
		numPoints: number;
		boundingBox: THREE.Box3;
		material: PointCloudMaterial;

		dispose(): void;
	}

	class PointCloudMaterial extends THREE.ShaderMaterial {
		pointSize: number;
		pointColorType: string;
		pointSizeMin: number;
		pointSizeMax: number;

		setSize(size: number): void;
		setColorType(type: string): void;
	}

	// 工具类
	namespace Utils {
		function loadSkybox(path: string): THREE.CubeTexture;
		function createGrid(): THREE.Object3D;
	}

	// 控制类
	namespace Controls {
		class OrbitControls {
			constructor(camera: THREE.Camera, domElement: HTMLElement);
			enabled: boolean;
			dispose(): void;
		}

		class FirstPersonControls {
			constructor(camera: THREE.Camera, domElement: HTMLElement);
			enabled: boolean;
			dispose(): void;
		}

		class EarthControls {
			constructor(camera: THREE.Camera, domElement: HTMLElement);
			enabled: boolean;
			dispose(): void;
		}
	}

	// 渲染器
	class EDLRenderer {
		constructor(viewer: Viewer);
		render(scene: THREE.Scene, camera: THREE.Camera): void;
		dispose(): void;
	}

	class HQSplatRenderer {
		constructor(viewer: Viewer);
		render(scene: THREE.Scene, camera: THREE.Camera): void;
		dispose(): void;
	}

	// 全局配置
	const resourcePath: string;
	const version: string;
}

export = Potree;
export as namespace Potree;
