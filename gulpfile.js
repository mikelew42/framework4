var gulp = require('gulp'),
	livereload = require('gulp-livereload'),
	open = require('open'),
	express = require('express'),
	port = parseInt(process.argv[2]) || 80;  // not sure why this doesn't work

gulp.task('server', function(next){
	var server = express().use(express.static( __dirname + '/public' )).listen(port, next);
	var portStr = port == 80 ? '' : ':' + port;
	console.log('Serving ' + 'http://localhost' + portStr);
	open("http://localhost" + portStr, "chrome");
});

gulp.task('default', ['server'], function(){
	var refresh = livereload();

	gulp.watch(['public/**']).on('change', function(file){
		refresh.changed(file.path);
	});

});