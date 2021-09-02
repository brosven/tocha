"use strict";

const {src, dest, series, watch} = require("gulp");
const plumber = require("gulp-plumber");
const server = require("browser-sync").create();
const sourcemap = require("gulp-sourcemaps");
const rename = require("gulp-rename");

const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const cssDeclarationSorter = require("css-declaration-sorter");

const svgstore = require("gulp-svgstore");

function css () {
    return src("source/sass/style.scss")
    .pipe(plumber({
        errorHandler: function(err) {
          console.log(err);
          this.emit('end');
        }
      }))
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
        autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(dest("source/css"))
    .pipe(server.stream());
}; 

function cssSort () {
  return src("source/sass/blocks/*.{scss,sass}")
  .pipe(postcss([
    cssDeclarationSorter({ order: 'smacss' })
  ]))
  .pipe(dest("source/sass/blocks"))
};

function sprite () {
    return src("source/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(dest("source/img"));
};

function serverStart () {
    server.init({
        server: "source/",
        notify: false,
        open: true,
        cors: true,
        ui: false
      });

    watch(["source/sass/**/*.{scss,sass}"], css);
    watch(["source/img/icon-*.svg"], series(sprite, server.reload))
    watch(["source/*.html"]).on("change", server.reload);
};

const build = series(sprite, css)
exports.css = css;
exports.serverStart = serverStart;
exports.sprite = sprite;
exports.cssSort = cssSort;
exports.build = build;
exports.start = series(build, serverStart);

