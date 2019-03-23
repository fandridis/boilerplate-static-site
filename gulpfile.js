var gulp = require("gulp");
var babel = require('gulp-babel');
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var sourcemaps = require("gulp-sourcemaps");
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var browserSync = require("browser-sync").create();


var paths = {
  styles: {
      src: "src/css/**/*.scss",
      dest: "public/css"
  },

  html: {
   src: "src/*.html",
   dest: "public"
  },

  js: {
    src: "src/js/**/*.js",
    dest: "public/js"
  },

  images: {
    src: "src/assets/images/**/*",
    dest: "public/assets/images"
  },

  general: {
    // This has its own path so we can later say to gulp to concat it first, before other css files
    cssResetMethod: "src/css/normalize.scss"
  }
};

// HTML task to copy the files to public folder
function html() {
  return (
    gulp
      .src(paths.html.src)
      .pipe(gulp.dest(paths.html.dest))
      .pipe(browserSync.reload({stream:true}))
  );
}

// HTML task without browserSync for build task
function htmlNoSync() {
  return (
    gulp
      .src(paths.html.src)
      .pipe(gulp.dest(paths.html.dest))
  );
}

// CSS task to convert SASS -> CSS, minify, concat and add prefixes.
function style() {
  return (
    gulp
      .src([paths.general.cssResetMethod, paths.styles.src])
      // Initialize sourcemaps before compilation starts
      .pipe(sourcemaps.init())
      .pipe(sass())
      .on("error", sass.logError)
      // Use postcss with autoprefixer and compress the compiled file using cssnano
      .pipe(postcss([autoprefixer({ browsers: ['last 3 versions'] }), cssnano()]))
      .pipe(concat('styles.min.css'))
      // Now add/write the sourcemaps
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(paths.styles.dest))
      // Add browsersync stream pipe after compilation
      .pipe(browserSync.stream())
  );
}

// Javascript task to convert ES6 -> ES5, minify and concat
function js() {
  return (
    gulp
      .src(paths.js.src)
      .pipe(babel({ presets: ['@babel/env']}))
      .pipe(uglify())
      .pipe(concat('main.min.js'))
      .pipe(gulp.dest(paths.js.dest))
  );
}

// Task for image optimization
function image() {
  return (
    gulp.src(paths.images.src)
      .pipe(imagemin())
      .pipe(gulp.dest(paths.images.dest))
  );
}

// Build task to be run to create the production ready site
function build(done) {
  return gulp.series(
    htmlNoSync,
    style,
    js,
    image
  )(done);
}

// Add browsersync initialization at the start of the watch task
function watch() {
  html();
  style();
  js();

  browserSync.init({
      server: {
          baseDir: "./public"
      }
  });
  gulp.watch(paths.styles.src, style);
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.js.src, js);
  	
  // We should tell gulp which files to watch to trigger the reload
  // gulp.watch(paths.html.src, reload);
}

// Exposed tasks
exports.watch = watch;
exports.build = build;
