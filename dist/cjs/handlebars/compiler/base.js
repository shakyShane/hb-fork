"use strict";
var parser = require("./parser")["default"];
var AST = require("./ast")["default"];
var WhitespaceControl = require("./whitespace-control")["default"];
var Helpers = require("./helpers");
var extend = require("../utils").extend;

exports.parser = parser;

var yy = {};
extend(yy, Helpers, AST);

function parse(input, options) {
  // Just return if an already-compiled AST was passed in.
  if (input.type === 'Program') { return input; }

  parser.yy = yy;

  // Altering the shared object here, but this is ok as parser is a sync operation
  yy.locInfo = function(locInfo) {
    return new yy.SourceLocation(options && options.srcName, locInfo);
  };

  function getPosition() {
    var pre = parser.lexer.pastInput();
    var c   = new Array(pre.length + 1).join("-");
    return {
      pre:      parser.lexer.pastInput(),
      upcoming: parser.lexer.upcomingInput(),
      string:   [pre + parser.lexer.upcomingInput(), c + "^"]
    };
  }

  parser.yy.parseError = function (str, hash) {
    var err = new Error(str);
    hash.position = getPosition();
    err.hash = hash;
    throw err;
  };

  var strip = new WhitespaceControl();
  return strip.accept(parser.parse(input));
}

exports.parse = parse;