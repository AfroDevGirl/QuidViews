'use strict';

var express = require('express');
var nodeApp = express();

nodeApp.use(express.logger('dev'));
nodeApp.listen(process.env.PORT || 5000);
