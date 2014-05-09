var pkg = require('./package.json'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    es = require('event-stream'),
    clean = require('gulp-clean'),
    jade = require('gulp-jade'),
    sass = require('gulp-ruby-sass'),
    minifycss = require('gulp-minify-css'),
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
        'templates' : './src/**/*.jade',
        'styles' : './src/styles/**/*.scss',
        'scripts' : './src/scripts/**/*.js',
        'tmp' : '.tmp/'
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
// CLEAN
// Let's clean some directories
gulp.task('clean', function () {
    gulp.src(options.paths.tmp, {read : false})
        .pipe(clean());
    gulp.src(options.paths.serve, {read : false})
        .pipe(clean());
    gulp.src(options.paths.build, {read : false})
        .pipe(clean());
});

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
gulp.task('sass', function () {
    gulp.src(options.paths.styles)
        .pipe(sass(options.sass))
        .pipe(autoprefixer())
        .pipe(gulp.dest(options.paths.tmp));
});

gulp.task('styles', ['sass'], function () {
    var bs = 'bower_components/twitter/dist/css/bootstrap.css';
    gulp.src([bs, options.paths.tmp + '*.css'])
        .pipe(concat('style.css'))
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

gulp.task('vendorscripts', ['scripts'], function () {
    var vendor = [
        'bower_components/jquery/dist/jquery.js',
        'bower_components/jquery-ui/ui/jquery-ui.js',
        'bower_components/twitter/dist/js/bootstrap.js',
        'bower_components/enquire/dist/enquire.js',
        'bower_components/fastclick/lib/fastclick.js',
        'bower_components/flexslider/jquery.flexslider.js',
        'bower_components/hoverintent/jquery.hoverIntent.js',
        'bower_components/jquery-placeholder/jquery.placeholder.js',
        'bower_components/jquery-waypoints/waypoints.js',
        'bower_components/jquery.cookie/jquery.cookie.js',
        'bower_components/modernizr/modernizr.js',
        'bower_components/superfish/dist/js/superfish.js',
        'bower_components/nanoscroller/bin/javascripts/jquery.nanoscroller.js'        
    ];

    gulp.src(vendor)
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest(options.paths.build + '/js/'));

});

gulp.task('scripts', ['lint-scripts'], function () {
    gulp.src(options.paths.scripts)
        .pipe(concat('app.js'))
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

gulp.task('build', ['templates', 'styles', 'scripts', 'vendorscripts']);

gulp.task('devPaths', ['clean'], function () {
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

gulp.task('dev', ['clean','devPaths', 'build', 'server', 'watch']);

gulp.task('default', ['dev']);
