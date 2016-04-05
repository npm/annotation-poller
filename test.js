/* global describe, it */

require('jsdom-global')()
document.body.innerHTML = '<ul class="box" id=""></ul>'

var annotationPoller = require('./')
var endpoint = '/api/v1/annotations.js'
var jQuery = require('jquery')

require('jquery-mockjax')(jQuery)
jQuery.mockjaxSettings.logging = false

describe('annotation-poller', function () {
  it('grabs an initial list of annotations when the page loads', function (done) {
    jQuery.mockjax({
      url: endpoint,
      responseText: [{
        uri: 'foo-package',
        status: 'warn',
        'status-message': 'module not yet scanned',
        description: 'foo security integration',
        'external-link': 'http://example.com/foo-package/audit',
        'external-link-text': 'start audit',
        timeout: 20
      }]
    })

    var poller = annotationPoller(function () {
      poller.annotations['foo-package'].status = 'warn'
      poller.annotations['foo-package'].description = 'foo security integration'
      return done()
    })
  })
})
