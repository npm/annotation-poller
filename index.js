var $ = require('jquery')
var Mustache = require('mustache')

function AnnotationPoller (opts) {
  this.pollInterval = opts.pollInterval || 3000
  this.pkg = opts.pkg // what package should we load annotations for?
  this.endpoint = '/api/v1/annotations/' + this.pkg
  this.annotations = {}
  this.template = '<li id="annotation-{{id}}" style="{{status}}" data-fingerprint={{fingerprint}}><span>{{description}}</span><a href="{{{external-link}}}">{{external-link-text}}</a></li>'
  this.addonSelector = '#npm-addon-box'
}

AnnotationPoller.prototype.start = function (loaded) {
  var _this = this
  var updating = false

  $(document).ready(function () {
    this.interval = setInterval(function () {
      if (updating) return
      updating = true

      _this.getAnnotations(function () {
        updating = false
        _this.renderAnnotations()
        if (loaded) {
          loaded()
          loaded = null
        }
      })
    }, this.pollInterval)
  })
}

AnnotationPoller.prototype.stop = function () {
  clearInterval(this.interval)
}

AnnotationPoller.prototype.getAnnotations = function (cb) {
  var _this = this
  $.getJSON(this.endpoint, function (data) {
    $.each(data, function (i, annotation) {
      _this.annotations[annotation.id] = annotation
    })
    return cb()
  })
}

AnnotationPoller.prototype.renderAnnotations = function () {
  var _this = this
  var annotation = null
  var annotationElement = null
  var newAnnotationElement = null
  var addonBox = $(this.addonSelector)

  Object.keys(this.annotations).forEach(function (key) {
    annotation = _this.annotations[key]
    if (annotation._rendered) return

    annotationElement = $('#annotation-' + annotation.id)
    newAnnotationElement = Mustache.render(_this.template, annotation)
    if (annotationElement.length) {
      // don't render the element unless its fingerprint has changed.
      if (annotationElement.data('fingerprint') !== annotation.fingerprint) {
        annotationElement.replaceWith(newAnnotationElement)
      }
    } else {
      addonBox.append(newAnnotationElement)
    }
    annotation._rendered = true
  })
}

module.exports = function (opts) {
  return new AnnotationPoller(opts)
}
