"use strict";

/* `remark-shortcodes` tests
   The offical remark tests use the tape harness, so we do too.
*/

var test = require("tape");
var remark = require("remark");
var shortcodes = require("./index.js");

/* Tests whether given markdown is rendered to correct markdown AST
 * @param {tape} t - the tape test harness object.
 * @param {string} markdown - the md string to render to AST.
 * @param {string} expectedAST - the AST expected from the md.
 */
function testAST(t, pluginOptions, markdown, expectedAST) {
  var tree = remark()
    .use(shortcodes, pluginOptions)
    .data("settings", { pedantic: true, position: false })
    .parse(markdown);
  t.deepEqual(tree, expectedAST);
}

test("test block level shortcode without attributes", function(t) {
  var markdown = "Drum and Bass\n\n[[ Youtube ]]";
  var expected = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Drum and Bass" }]
      },
      {
        type: "shortcode",
        identifier: "Youtube",
        attributes: {}
      }
    ]
  };
  testAST(t, {}, markdown, expected);
  t.end();
});

test("test block level shortcode with attributes", function(t) {
  var markdown =
    'Drum and Bass\n\n[[ Youtube id=3 share_code="abc" share-code="def" ]]\n\nTest sentence';
  var expected = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Drum and Bass" }]
      },
      {
        type: "shortcode",
        identifier: "Youtube",
        attributes: { id: "3", share_code: "abc", "share-code": "def" }
      },
      {
        type: "paragraph",
        children: [{ type: "text", value: "Test sentence" }]
      }
    ]
  };
  testAST(t, {}, markdown, expected);
  t.end();
});

test("test block level shortcode with custom start/end blocks", function(t) {
  var markdown =
    'Drum and Bass\n\n{{% Youtube id=3 share-code="abc" %}}\n\nTest sentence';
  var expected = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Drum and Bass" }]
      },
      {
        type: "shortcode",
        identifier: "Youtube",
        attributes: { id: "3", "share-code": "abc" }
      },
      {
        type: "paragraph",
        children: [{ type: "text", value: "Test sentence" }]
      }
    ]
  };
  testAST(t, { startBlock: "{{%", endBlock: "%}}" }, markdown, expected);
  t.end();
});
