import parser from "./parser";
import AST from "./ast";
module Helpers from "./helpers";
import { extend } from "../utils";

export { parser };

var yy = {};
extend(yy, Helpers, AST);

export function parse(input) {
    // Just return if an already-compile AST was passed in.
    if (input.constructor === AST.ProgramNode) {
        return input;
    }

    parser.yy = yy;

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

    return parser.parse(input);
}
