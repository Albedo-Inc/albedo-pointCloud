export * from "./defines.js";
export * from "./Enum.js";
export * from "./EventDispatcher.js";
export * from "./Features.js";
export * from "./KeyCodes.js";
export * from "./LRU.js";
export * from "./PointCloudOctree.js";
export * from "./PointCloudOctreeGeometry.js";
export * from "./PointCloudTree.js";
export * from "./Points.js";
export * from "./Potree_update_visibility.js";
export * from "./PotreeRenderer.js";
export * from "./utils.js";
export * from "./Version.js";
export * from "./WorkerPool.js";
export * from "./XHRFactory.js";
export * from "./TextSprite.js";

export * from "./materials/ClassificationScheme.js";
export * from "./materials/EyeDomeLightingMaterial.js";
export * from "./materials/Gradients.js";
export * from "./materials/NormalizationEDLMaterial.js";
export * from "./materials/NormalizationMaterial.js";
export * from "./materials/PointCloudMaterial.js";

export * from "./loader/PointAttributes.js";
export * from "./loader/LasLazLoader.js";
export * from "./loader/BinaryLoader.js";
export * from "./modules/loader/2.0/OctreeLoader.js";

export * from "./utils/Message.js";

export * from "./viewer/viewer.js";
export * from "./viewer/Scene.js";

export {OrbitControls} from "./navigation/OrbitControls.js";
export {FirstPersonControls} from "./navigation/FirstPersonControls.js";
export {EarthControls} from "./navigation/EarthControls.js";
export {DeviceOrientationControls} from "./navigation/DeviceOrientationControls.js";
export {VRControls} from "./navigation/VRControls.js";
import {POCLoader} from "./loader/POCLoader.js";
import "./extensions/OrthographicCamera.js";
import "./extensions/PerspectiveCamera.js";
import "./extensions/Ray.js";

import {LRU} from "./LRU.js";
import {PointCloudOctree} from "./PointCloudOctree.js";
import {WorkerPool} from "./WorkerPool.js";
import {OctreeLoader} from "./modules/loader/2.0/OctreeLoader.js";

export const workerPool = new WorkerPool();

export const version = {
	major: 1,
	minor: 8,
	suffix: '.0-simplified'
};

export let lru = new LRU();

console.log('Potree ' + version.major + '.' + version.minor + version.suffix);

export let pointBudget = 1 * 1000 * 1000;
export let framenumber = 0;
export let numNodesLoading = 0;
export let maxNodesLoading = 4;

export const debug = {};

let scriptPath = "";

if (document.currentScript && document.currentScript.src) {
	scriptPath = new URL(document.currentScript.src + '/..').href;
	if (scriptPath.slice(-1) === '/') {
		scriptPath = scriptPath.slice(0, -1);
	}
} else if(import.meta){
	scriptPath = new URL(import.meta.url + "/..").href;
	if (scriptPath.slice(-1) === '/') {
		scriptPath = scriptPath.slice(0, -1);
	}
}else {
	console.error('Potree was unable to find its script path using document.currentScript. Is Potree included with a script tag? Does your browser support this function?');
}

let resourcePath = scriptPath + '/resources';

// scriptPath: build/potree
// resourcePath:build/potree/resources
export {scriptPath, resourcePath};

export function loadPointCloud(path, name, callback){
	let loaded = function(e){
		e.pointcloud.name = name;
		callback(e);
	};

	let promise = new Promise( resolve => {
		// load pointcloud - simplified version for LAS/LAZ only
		if (!path){
			console.error(new Error('No path provided for point cloud'));
		} else if (path.indexOf('metadata.json') > 0) {
			// Use OctreeLoader for metadata.json files
			OctreeLoader.load(path).then(e => {
				let geometry = e.geometry;
				if(!geometry){
					console.error(new Error(`failed to load point cloud from URL: ${path}`));
				}else{
					let pointcloud = new PointCloudOctree(geometry);
					resolve({type: 'pointcloud_loaded', pointcloud: pointcloud});
				}
			});
		}else if (path.indexOf('cloud.js') > 0) {
			POCLoader.load(path, function (geometry) {
				if (!geometry) {
					//callback({type: 'loading_failed'});
					console.error(new Error(`failed to load point cloud from URL: ${path}`));
				} else {
					let pointcloud = new PointCloudOctree(geometry);
					// loaded(pointcloud);
					resolve({type: 'pointcloud_loaded', pointcloud: pointcloud});
				}
			});
		} else {
			console.error(new Error(`Unsupported point cloud format. Only LAS/LAZ with metadata.json is supported in this simplified version.`));
		}
	});

	promise.then(loaded);

	return promise;
}


// add selectgroup
(function($){
	$.fn.extend({
		selectgroup: function(args = {}){

			let elGroup = $(this);
			let rootID = elGroup.prop("id");
			let groupID = `${rootID}`;
			let groupTitle = args.title || "";

			let elButtons = [];
			elGroup.find("option").each((index, e) => {
				let elOption = $(e);
				let buttonID = elOption.prop("id");
				let label = elOption.html();
				let value = elOption.prop("value");

				let elButton = $(`
					<span style="flex-grow: 1; display: inherit">
					<label for="${buttonID}" class="ui-button" style="width: 100%; padding: .4em .1em">${label}</label>
					<input type="radio" name="${groupID}" id="${buttonID}" value="${value}" style="opacity: 0; z-index: -1000; position: absolute;">
					</span>
				`);

				elButtons.push(elButton);
			});

			let elButtonGroup = $(`
				<div data-toggle="buttons" style="display: flex; border-radius: 5px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.12)">

				</div>
			`);

			for(let elButton of elButtons){
				elButtonGroup.append(elButton);
			}

			elButtonGroup.find("label").each( (index, e) => {
				let elLabel = $(e);
				
				elLabel.hover( 
					e => elLabel.css("background-color", "rgba(255, 255, 255, 0.1)"),
					e => elLabel.css("background-color", "")
				);

				elLabel.click( e => {
					elButtonGroup.find("label").removeClass("ui-state-active");
					elButtonGroup.find("label").css("background-color", "");

					elLabel.addClass("ui-state-active");
					elLabel.css("background-color", "rgba(255, 255, 255, 0.2)");
				});

			});

			elGroup.empty();
			elGroup.append(elButtonGroup);

		}
	});

})(jQuery);
