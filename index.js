/* jshint node: true */
'use strict';
var path = require('path');

module.exports = {
  name: 'ember-music-player',

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  included: function(app) {
    this._super.included(app);
    app.import('vendor/music-player/music-player.css');
    app.import(app.bowerDirectory + '/moment/moment.js');
    app.import(app.bowerDirectory + '/moment-duration-format/lib/moment-duration-format.js');
  }
};
