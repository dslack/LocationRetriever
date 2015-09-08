var gulp        =   require('gulp'),
    ngAnnotate  =   require('gulp-ng-annotate'),
    uglify      =   require('gulp-uglify'),
    rename      =   require('gulp-rename');

gulp.task('default', function(){
    return gulp.src('src/location-retriever.js')
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(rename('location-retriever.min.js'))
        .pipe(gulp.dest('dist'));
});