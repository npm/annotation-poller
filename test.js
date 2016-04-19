/* global describe, it, beforeEach */

require('jsdom-global')()

var annotationPoller = require('./')
var pkg = encodeURIComponent('cool module')
var endpoint = '/api/v1/annotations/' + pkg
var $ = require('jquery')

require('jquery-mockjax')($)
$.mockjaxSettings.logging = false

require('chai').should()

describe('annotation-poller', function () {
  beforeEach(function (cb) {
    document.body.innerHTML = '<ul class="box" id="npm-addon-box"></ul>'
    $.mockjax.clear()
    return cb()
  })

  it('grabs an initial list of annotations when the page loads', function (done) {
    $.mockjax({
      url: endpoint,
      responseText: [{
        id: 'abc-123-abc',
        status: 'warn',
        'status-message': 'module not yet scanned',
        description: 'foo security integration',
        'external-link': 'http://example.com/foo-package/audit',
        'external-link-text': 'start audit',
        fingerprint: 'foo'
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      poller.annotations['abc-123-abc'].status = 'warn'
      poller.annotations['abc-123-abc'].description = 'foo security integration'
      poller.stop()
      return done()
    })
  })

  it('renders a new annotation', function (done) {
    $.mockjax({
      url: endpoint,
      responseText: [{
        id: 'abc-123-abc',
        status: 'warn',
        'status-message': 'module not yet scanned',
        description: 'my awesome integration',
        'external-link': 'http://example.com/foo-package/audit',
        'external-link-text': 'start audit',
        fingerprint: 'bar'
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      $('ul li').length.should.equal(1)
      $('ul li').text().should.match(/my awesome integration/)
      poller.stop()
      return done()
    })
  })

  it('replaces an existing annotation with new data from an integration', function (done) {
    $.mockjax({
      url: endpoint,
      responseText: [{
        id: 'abc-123-abc',
        status: 'warn',
        'status-message': 'module not yet scanned',
        description: 'my awesome integration',
        'external-link': 'http://example.com/foo-package/audit',
        'external-link-text': 'start audit',
        fingerprint: 'foo'
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      $.mockjax.clear()
      $.mockjax({
        url: endpoint,
        responseText: [{
          id: 'abc-123-abc',
          status: 'green',
          'status-message': 'module scanned',
          description: 'my awesome integration',
          'external-link': 'http://example.com/foo-package/audit',
          'external-link-text': 'view details',
          fingerprint: 'bar'
        }]
      })

      setTimeout(function () {
        $('ul li').length.should.equal(1)
        $('ul li').text().should.match(/view details/)
        poller.stop()
        return done()
      }, 1000)
    })
  })

  it('adds an additional annotation from a new integration', function (done) {
    $.mockjax({
      url: endpoint,
      responseText: [{
        id: 'abc-123-abc',
        status: 'warn',
        'status-message': 'module not yet scanned',
        description: 'my awesome integration',
        'external-link': 'http://example.com/foo-package/audit',
        'external-link-text': 'start audit',
        fingerprint: 'foo'
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      $.mockjax.clear()
      $.mockjax({
        url: endpoint,
        responseText: [{
          id: 'fed-234-abc',
          status: 'green',
          'status-message': 'module licensed',
          description: 'my second integration',
          'external-link': 'http://example.com/foo-package/audit',
          'external-link-text': 'view details',
          fingerprint: 'foo'
        }]
      })

      setTimeout(function () {
        $('ul li').length.should.equal(2)
        $('ul li:first').text().should.match(/my awesome integration/)
        $('ul li:last').text().should.match(/my second integration/)
        poller.stop()
        return done()
      }, 1000)
    })
  })
})
