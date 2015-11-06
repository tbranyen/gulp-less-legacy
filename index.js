var path           = require('path');
var through2       = require('through2');
var gutil          = require('gulp-util');
var assign         = require('object-assign');
var applySourceMap = require('vinyl-sourcemaps-apply');

var PluginError    = gutil.PluginError;
var less           = require('less');

module.exports = function (options) {
  // Mixes in default options.
  options = assign({}, {
      compress: false,
      paths: []
    }, options);

  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError('gulp-less', 'Streaming not supported'));
    }

    var str = file.contents.toString();

    // Clones the options object
    var opts = assign({}, options);

    // Injects the path of the current file
    opts.filename = file.path;

    less.render(str, opts, function(err, result) {
      if (err) {
        // Convert the keys so PluginError can read them
        err.lineNumber = err.line;
        err.fileName = err.filename;

        // Add a better error message
        err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

        throw new PluginError('gulp-less', err);
      }

      file.contents = new Buffer(result);
      file.path = gutil.replaceExtension(file.path, '.css');

      cb(null, file);
    });
  });
};
