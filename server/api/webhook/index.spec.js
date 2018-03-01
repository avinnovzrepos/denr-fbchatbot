'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var webhookCtrlStub = {
  index: 'webhookCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var webhookIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './webhook.controller': webhookCtrlStub
});

describe('Webhook API Router:', function() {
  it('should return an express router instance', function() {
    expect(webhookIndex).to.equal(routerStub);
  });

  describe('GET /api/webhook', function() {
    it('should route to webhook.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'webhookCtrl.index')
        ).to.have.been.calledOnce;
    });
  });
});
