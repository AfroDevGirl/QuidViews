'use strict';

describe('Service: videoFeed', function () {

  // load the service's module
  beforeEach(module('quidditchVideoPlayerApp'));

  // instantiate service
  var videoFeed;
  beforeEach(inject(function (_videoFeed_) {
    videoFeed = _videoFeed_;
  }));

  it('should do something', function () {
    expect(!!videoFeed).toBe(true);
  });

});
