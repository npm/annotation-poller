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
        name: 'Awesome Integration',
        fingerprint: 'a',
        rows: [{
          image: {
            url: 'http://www.example.com/img',
            text: 'image alt'
          },
          link: {
            url: 'http://www.example.com',
            text: 'my awesome link'
          },
          text: 'hello *world*!'
        }]
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
        name: 'second integration',
        fingerprint: 'b',
        rows: [{
          link: {
            url: 'http://www.example.com',
            text: 'my awesome link'
          }
        }]
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      $('.addon-container').length.should.equal(1)
      $('.addon-container').text().should.match(/second integration/)
      poller.stop()
      return done()
    })
  })

  it('replaces *text* with bold', function (done) {
    $.mockjax({
      url: endpoint,
      responseText: [{
        id: 'abc-123-abc',
        name: 'second integration',
        fingerprint: 'c',
        rows: [{
          text: 'my *awesome* <b>message</b>'
        }]
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      $('b').text().should.equal('awesome')
      poller.stop()
      return done()
    })
  })

  it('handles an array of links', function (done) {
    $.mockjax({
      url: endpoint,
      responseText: [{
        id: 'abc-123-abc',
        name: 'second integration',
        fingerprint: 'd',
        rows: [{
          link: [{url: 'http://example.com', text: 'link 1'}, {url: 'http://2.example.com', text: 'link 2'}]
        }]
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      $('.addon-container:first').text().should.match(/link 1/)
      $('.addon-container:last').text().should.match(/link 2/)
      poller.stop()
      return done()
    })
  })

  it('replaces an existing annotation with new data from an integration', function (done) {
    $.mockjax({
      url: endpoint,
      responseText: [{
        id: 'abc-123-abc',
        name: 'third integration',
        fingerprint: 'foo',
        rows: [{
          link: {
            url: 'http://www.example.com',
            text: 'initial link'
          }
        }]
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      $.mockjax.clear()
      $.mockjax({
        url: endpoint,
        responseText: [{
          id: 'abc-123-abc',
          name: 'third integration',
          fingerprint: 'bar',
          rows: [{
            link: {
              url: 'http://www.example.com',
              text: 'replaced link'
            }
          }]
        }]
      })

      setTimeout(function () {
        $('.addon-container').length.should.equal(1)
        $('.addon-container').text().should.match(/replaced link/)
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
        name: 'third integration',
        fingerprint: 'foo',
        rows: [{
          link: {
            url: 'http://www.example.com',
            text: 'initial link 1'
          }
        }]
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      $.mockjax.clear()
      $.mockjax({
        url: endpoint,
        responseText: [{
          id: 'fed-123-abc',
          name: 'third integration',
          fingerprint: 'foo',
          rows: [{
            link: {
              url: 'http://www.example.com',
              text: 'initial link 2'
            }
          }]
        }]
      })

      setTimeout(function () {
        $('.addon-container').length.should.equal(2)
        $('.addon-container:first').text().should.match(/initial link 1/)
        $('.addon-container:last').text().should.match(/initial link 2/)
        poller.stop()
        return done()
      }, 1000)
    })
  })
})
