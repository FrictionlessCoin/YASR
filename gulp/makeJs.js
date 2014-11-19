var gulp = require('gulp'),
	browserify = require('browserify'),
	connect = require('gulp-connect'),
	concat = require('gulp-concat'),
	embedlr = require('gulp-embedlr'),
	jsValidate = require('gulp-jsvalidate'),
	source = require('vinyl-source-stream'),
	uglify = require("gulp-uglify"),
	rename = require("gulp-rename"),
	streamify = require('gulp-streamify'),
	paths = require("./paths.js"),
	buffer = require('vinyl-buffer'),
	exorcist = require('exorcist'),
	optionalShim = require('./optionalShim.js'),
	sourcemaps = require('gulp-sourcemaps');

gulp.task('browserify', function() {
	browserify({entries: ["./src/main.js"],standalone: "YASR", debug: true})
		.transform({global:true}, optionalShim)
		.exclude('jquery')
		.exclude('codemirror')
		.exclude('../lib/DataTables/media/js/jquery.dataTables.js')
		.exclude('jquery.dataTables')
		.bundle()
		.pipe(exorcist(paths.bundleDir + '/' + paths.bundleName + '.js.map'))
		.pipe(source(paths.bundleName + '.js'))
		.pipe(gulp.dest(paths.bundleDir))
		.pipe(rename(paths.bundleName + '.min.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({
			loadMaps: true,
			//we need to -not- include the content. Break-points only work when using this particular trick
			includeContent: false,
		      sourceRoot: function(file) {
		        return './';
		      }
		}))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.bundleDir));
});



gulp.task('browserifyWithDeps', function() {
	var bundler = browserify({entries: ["./src/main.js"],standalone: "YASR", debug: true});
	
	return bundler
		.bundle()
		.pipe(exorcist(paths.bundleDir + '/' + paths.bundleName + '.bundled.js.map'))
		.pipe(source(paths.bundleName + '.bundled.js'))
		.pipe(gulp.dest(paths.bundleDir))
		.pipe(rename(paths.bundleName + '.bundled.min.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({
			loadMaps: true,
			//we need to -not- include the content. Break-points only work when using this particular trick
			includeContent: false,
		      sourceRoot: function(file) {
		        return './';
		      }
		}))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.bundleDir));
});


/**
 * Faster, because we don't minify, and include source maps in js file (notice we store it with .min.js extension, so we don't have to change the index.html file for debugging)
 */
gulp.task('browserifyForDebug', function() {
	var bundler = browserify({entries: ["./src/main.js"],standalone: "YASR", debug: true});
	
	return bundler
		.bundle()
		.pipe(source(paths.bundleName + '.bundled.min.js'))
		.pipe(embedlr())
		.pipe(gulp.dest(paths.bundleDir))
		.pipe(connect.reload());
});

