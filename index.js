var $ = require('jquery')
var Handlebars = require('handlebars')

function AnnotationPoller (opts) {
  this._installExtensions()

  this.pollInterval = opts.pollInterval || 3000
  this.pkg = opts.pkg // what package should we load annotations for?
  this.endpoint = '/api/v1/annotations/' + this.pkg
  this.annotations = {}
  this.template = Handlebars.compile(
    '<li id="annotation-{{id}}" style="{{status}}" data-fingerprint={{fingerprint}}>' +
    '<ul class="addon-container">' +
    '  <li><h3>{{name}}</h3></li>' +
    '  {{#each rows}}' +
    '    <li>' +
    '    {{#hasKey this "image"}}' +
    '      <img src="{{{image.url}}}" alt="{{image.text}}" />' +
    '    {{/hasKey}}' +
    '    {{#hasKey this "link"}}' +
    '      {{#isArray this "link"}}' +
    '        {{#each link}}' +
    '          <a href="{{{url}}}">{{text}}</a>{{#unless @last}},{{/unless}}' +
    '        {{/each}}' +
    '        {{else}}' +
    '          <a href="{{{link.url}}}">{{link.text}}</a>' +
    '     {{/isArray}}' +
    '     {{/hasKey}}' +
    '     {{#hasKey this "text"}}' +
    '       <span>{{{text}}}</span>' +
    '     {{/hasKey}}' +
    '  </li>' +
    '  {{/each}}' +
    '</ul>' +
  '</li>')
  this.addonSelector = '#npm-addon-box'
}

AnnotationPoller.prototype._installExtensions = function () {
  Handlebars.registerHelper('hasKey', function (obj, key, options) {
    if (typeof obj === 'object' && obj[key]) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  })

  Handlebars.registerHelper('isArray', function (obj, key, options) {
    if ($.isArray(obj[key])) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  })
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
    }, _this.pollInterval)
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
    annotation = _this._applyReplacements(_this.annotations[key])
    if (annotation._rendered) return

    annotationElement = $('#annotation-' + annotation.id)
    newAnnotationElement = _this.template(annotation)
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

AnnotationPoller.prototype._applyReplacements = function (obj) {
  var _this = this
  if ($.isArray(obj.rows)) {
    obj.rows.forEach(function (row) {
      // bold any text in between *foo*.
      if (row.text) {
        row.text = _this._escape(row.text)
        row.text = row.text.replace(/\*(.+)\*/, '<b>$1</b>')
      }

      // escape any HTML in links.
      if ($.isArray(row.link)) {
        row.link.forEach(function (l) {
          if (l.url) l.url = _this._escape(l.url)
        })
      } else if (row.link) {
        if (row.link.url) row.link.url = _this._escape(row.link.url)
      }

      // escape any HTML in image links.
      if (row.image) {
        if (row.image.url) row.image.url = _this._escape(row.image.url)
      }
    })
  } else {
    // we shouldn't allow obj.rows
    // to be a non-array value.
    obj.rows = []
  }
  return obj
}

AnnotationPoller.prototype._escape = function (text) {
  return $('<div>').text(text).html()
}

module.exports = function (opts) {
  return new AnnotationPoller(opts)
}
