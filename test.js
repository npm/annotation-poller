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

  it('gracefully handles an upstream error', function (done) {
    $.mockjax({
      url: endpoint,
      status: 500,
      responseText: "ENOGOOD"
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      poller.stop()
      return done()
    })
  })

  it('respects the element ordering', function (done) {
    $.mockjax({
      url: endpoint,
      responseText: [{
        id: 'abc-123-abc',
        name: 'second integration',
        fingerprint: 'bb',
        rows: [{
          link: {
            url: 'http://www.example.com',
            text: 'my awesome link'
          },
          image: {
            url: 'http://www.example.com/img',
            text: 'image alt'
          }
        }]
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      var children = $('.addon-container li:eq(1)').children()
      $(children[0]).is('a').should.equal(true)
      $(children[1]).is('img').should.equal(true)
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
      $('strong').text().should.equal('awesome')
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

  it('renders non-linked images', function (done) {
    $.mockjax({
      url: endpoint,
      responseText: [{
        id: 'test-image-render',
        name: 'image render test integration',
        fingerprint: 'tir',
        rows: [{
          image: {
            url: 'http://www.example.com/img.png',
            text: 'my awesome image link'
          }
        }]
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      $('.addon-container:last > li > a').length.should.be.equal(0);
      $('.addon-container:last > li > img').length.should.be.equal(1);
      poller.stop()
      return done()
    })
  })

  it('renders image links', function (done) {
    $.mockjax({
      url: endpoint,
      responseText: [{
        id: 'test-image-link',
        name: 'image link test integration',
        fingerprint: 'til',
        rows: [{
          image: {
            url: 'http://www.example.com/img.png',
            text: 'my awesome image link',
            href: 'http://www.example.com/link'
          }
        }]
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      $('.addon-container:last > li > a').length.should.be.equal(1);
      $('.addon-container:last > li > a > img').length.should.be.equal(1);
      poller.stop()
      return done()
    })
  })

  it('renders multiple images and image links', function (done) {
    $.mockjax({
      url: endpoint,
      responseText: [{
        id: 'test-multi-mixed-image-links',
        name: 'mixed multi image links',
        fingerprint: 'tmmil',
        rows: [{
          image: [{
            url: 'http://www.example.com/img1.png',
            text: 'my awesome image link',
            href: 'http://www.example.com/link1'
          }, {
            url: 'http://www.example.com/img2.png',
            text: 'my awesome image link'
          }, {
            url: 'http://www.example.com/img3.png',
            text: 'my awesome image link',
            href: 'http://www.example.com/link3'
          }]
        }]
      }]
    })

    var poller = annotationPoller({pollInterval: 50, pkg: pkg})
    poller.start(function () {
      $('.addon-container:last > li > a').length.should.be.equal(2);
      $('.addon-container:last > li > a > img').length.should.be.equal(2);
      $('.addon-container:last > li > img').length.should.be.equal(1);
      $('.addon-container:last > li img').length.should.be.equal(3);
      poller.stop()
      return done()
    })
  })
})
