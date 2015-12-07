'use strict';

var compression = require('compression');
var express = require('express');
var nodeApp = express();

nodeApp.use(express.logger('dev'));
nodeApp.use(compression());
nodeApp.listen(process.env.PORT || 5000);
