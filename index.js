var $ = require('jquery')

function AnnotationPoller (loaded) {
  var _this = this
  this.endpoint = '/api/v1/annotations.js'
  this.annotations = {}

  $(document).ready(function () {
    _this.load(function () {
      return loaded()
    })
  })
}

AnnotationPoller.prototype.load = function (cb) {
  var _this = this
  $.getJSON(this.endpoint, function (data) {
    $.each(data, function (i, annotation) {
      _this.annotations[annotation.uri] = annotation
    })
    return cb()
  })
}

module.exports = function (loaded) {
  return new AnnotationPoller(loaded)
}
