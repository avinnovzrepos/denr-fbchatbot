'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

describe('Webhook API:', function() {
  describe('GET /api/webhook', function() {
    var webhooks;

    beforeEach(function(done) {
      request(app)
        .get('/api/webhook')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          webhooks = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(webhooks).to.be.instanceOf(Array);
    });
  });
});
