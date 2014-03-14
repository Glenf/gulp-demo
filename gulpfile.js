var pkg = require('./package.json'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    jade = require('gulp-jade'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    sprite = require('gulp-spritesmith'),
    connect = require('gulp-connect'),
    lrServer = require('tiny-lr'),
    livereload = require('gulp-livereload'),
    symlink = require('gulp-symlink');


var options = {
    paths : {
        'build' : './dist/',
        'serve' : './.dev/',
        'templates' : './src/jade/**/*.jade',
        'styles' : './src/sass/**/*.scss',
        'scripts' : './src/js/**/*.js'
    },
    jade : {
        'data' : pkg,
        'pretty' : false
    },
    sass : {
        'sourcemap' : false,
        'style' : 'compact'
    },
    jshint : {
        'strict' : true
    },
    server : {
        'host' : 'localhost',
        'livereloadPort' : '35729',
        'port' : '9000'
    }
};

//
// TEMPLATES
//
gulp.task('templates', function () {
    return gulp.src(options.paths.templates)
        .pipe(jade(options.jade))
        .pipe(gulp.dest(options.paths.build))
        .pipe(connect.reload());
});

//
// STYLES
//
gulp.task('styles', function () {
    return gulp.src(options.paths.styles)
        .pipe(sass(options.sass))
        .pipe(autoprefixer())
        .pipe(gulp.dest(options.paths.build + '/css/'))
        .pipe(connect.reload());
});

//
// SCRIPTS
//
gulp.task('lint-scripts', function () {
    gulp.src(options.paths.scripts)
        .pipe(jshint(options.jshint));
});
gulp.task('scripts', ['lint-scripts'], function () {
    return gulp.src(options.paths.scripts)
        .pipe(gulp.dest(options.paths.build + '/js/'))
        .pipe(connect.reload());
});

//
// SERVER
//
var serverAddr = 'http://'+options.server.host+':'+options.server.port;
gulp.task('server', connect.server({
    root : [options.paths.serve],
    host : options.server.host,
    port : options.server.port,
    livereload : {
        port : options.server.livereloadPort
    }
}));

gulp.task('build', ['templates', 'styles', 'scripts']);

gulp.task('devPaths', function () {
    options.paths.build = options.paths.serve;
    options.jade.pretty = true;
    options.sass.sourcemap = true;
    options.sass.style = 'expandend';
});

gulp.task('watch', function () {
    gulp.watch([options.paths.templates], ['templates']);
    gulp.watch([options.paths.styles], ['styles']);
    gulp.watch([options.paths.scripts], ['scripts']);
});

gulp.task('dev', ['devPaths', 'build', 'server', 'watch']);

gulp.task('default', function () {
    // Default tasks here
});
