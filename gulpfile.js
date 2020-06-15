const { src, dest } = require('gulp');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;

let test = async () => {
	return console.log('Gulp is running...');
};

let cleanJS = async (cb) => {
	src('./src/client.js')
		.pipe(
			rename({
				basename: 'client.min',
				extname: '.js',
			})
		)
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(uglify())
		.pipe(dest('./public/'));
	cb();
};

exports.build = cleanJS;
exports.default = cleanJS;
