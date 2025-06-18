const path = require('path');
const gulp = require('gulp');
const exec = require('child_process').exec;

const fs = require("fs");
const fsp = fs.promises;
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const {watch} = gulp;

let paths = {
	laslaz: [
		"build/workers/laslaz-worker.js",
		"build/workers/lasdecoder-worker.js",
	],
	html: [
		"src/viewer/potree.css",
		"src/viewer/sidebar.html"
	],
	resources: [
		"resources/icons/**/*",
		"resources/textures/**/*",
		"resources/images/**/*",
		"resources/*.svg",
		"resources/*.png",
		"resources/LICENSE"
	]
};

let workers = {
	"LASLAZWorker": [
		"libs/plasio/workers/laz-perf.js",
		"libs/plasio/workers/laz-loader-worker.js"
	],
	"LASDecoderWorker": [
		"src/workers/LASDecoderWorker.js"
	]
};

let shaders = [
	"src/materials/shaders/pointcloud.vs",
	"src/materials/shaders/pointcloud.fs",
	"src/materials/shaders/pointcloud_sm.vs",
	"src/materials/shaders/pointcloud_sm.fs",
	"src/materials/shaders/normalize.vs",
	"src/materials/shaders/normalize.fs",
	"src/materials/shaders/normalize_and_edl.fs",
	"src/materials/shaders/edl.vs",
	"src/materials/shaders/edl.fs",
	"src/materials/shaders/blur.vs",
	"src/materials/shaders/blur.fs",
];

// For development, it is now possible to use 'gulp webserver'
// from the command line to start the server (default port is 1235)
gulp.task('webserver', gulp.series(async function() {
	const server = connect.server({
		port: 1235,
		https: false,
		livereload: true,
		root: '.'
	});
}));

gulp.task("workers", async function(done){

	for(let workerName of Object.keys(workers)){

		gulp.src(workers[workerName])
			.pipe(concat(`${workerName}.js`))
			.pipe(gulp.dest('build/potree/workers'));
	}

	done();
});

gulp.task("workers-2.0", async function(done){
	// 创建2.0目录
	if(!fs.existsSync("build/potree/workers/2.0")){
		fs.mkdirSync("build/potree/workers/2.0", { recursive: true });
	}

	// 只复制基础的DecoderWorker用于向后兼容
	gulp.src([
		"src/modules/loader/2.0/DecoderWorker.js"
	]).pipe(gulp.dest('build/potree/workers/2.0'));

	done();
});

gulp.task("shaders", async function(){

	const components = [
		"let Shaders = {};"
	];

	for(let file of shaders){
		const filename = path.basename(file);

		const content = await fsp.readFile(file);

		const prep = `Shaders["${filename}"] = \`${content}\``;

		components.push(prep);
	}

	components.push("export {Shaders};");

	const content = components.join("\n\n");

	const targetPath = `./build/shaders/shaders.js`;

	if(!fs.existsSync("build/shaders")){
		fs.mkdirSync("build/shaders");
	}
	fs.writeFileSync(targetPath, content, {flag: "w"});
});

gulp.task('build', 
	gulp.series(
		gulp.parallel("workers", "workers-2.0", "shaders"),
		async function(done){
			gulp.src(paths.html).pipe(gulp.dest('build/potree'));

			// 保持原有目录结构复制resources
			gulp.src(paths.resources, {base: '.'}).pipe(gulp.dest('build/potree'));

			gulp.src(["LICENSE"]).pipe(gulp.dest('build/potree'));

			done();
		}
	)
);

gulp.task("pack", async function(){
	exec('rollup -c', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
	});
});

gulp.task('watch', gulp.parallel("build", "pack", "webserver", async function() {

	let watchlist = [
		'src/**/*.js',
		'src/**/**/*.js',
		'src/**/*.css',
		'src/**/*.html',
		'src/**/*.vs',
		'src/**/*.fs',
		'resources/**/*',
		'examples/**/*.json',
		'examples/**/*.html'
	];

	watch(watchlist, gulp.series("build", "pack", function(done) {
		gulp.src(watchlist)
			.pipe(connect.reload());
		done();
	}));

}));


