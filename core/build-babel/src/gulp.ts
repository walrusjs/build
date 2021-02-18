import gulp, { TaskFunction } from 'gulp';
import postcss from 'gulp-postcss';
import { BabelOptions } from './types';

const less = require('gulp-less');

const gulpTask = (opts: BabelOptions) => {
  const styleTask: TaskFunction = (cb) => {
    gulp.src(`${opts.buildDir}/**/*.less`)
      .pipe(less())
      .pipe(postcss([
        require('autoprefixer')
      ]))
      .pipe(gulp.dest(`${opts.outDir}/`))
    cb();
  };

  return gulp.series(styleTask);
};

export default gulpTask;
