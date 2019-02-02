"use strict";

/* `remark-shortcodes` tests
   The offical remark tests use the tape harness, so we do too.
*/

var test = require("tape");
var remark = require("remark");
var shortcodes = require("./index.js");

/**
 * Tests whether given markdown is rendered to correct markdown AST and vice versa
 * @param {tape} t - the tape test harness object.
 * @param {string} inputMarkdown - denormalized input text.
 * @param {string} outputMarkdown - normalized output text.
 * @param {string} ast - the AST expected from the md.
 */
function tester(t, pluginOptions, inputMarkdown, outputMarkdown, ast) {
  var tree1 = remark()
    .use(shortcodes, pluginOptions)
    .data("settings", { pedantic: true, position: false })
    .parse(inputMarkdown);
  t.deepEqual(
    tree1,
    ast,
    "ast should be parsed correctly from denormalized markdown"
  );

  var tree2 = remark()
    .use(shortcodes, pluginOptions)
    .data("settings", { pedantic: true, position: false })
    .parse(outputMarkdown);
  t.deepEqual(
    tree2,
    ast,
    "ast should be parsed correctly from normalized markdown"
  );

  var string = remark()
    .use(shortcodes, pluginOptions)
    .data("settings", { pedantic: true, position: false })
    .stringify(ast);
  t.is(
    string,
    outputMarkdown,
    "normalized markdown should be generated from ast"
  );
}

test("test block level shortcode without attributes", function(t) {
  var inputMarkdown = "Drum and Bass\n\n[[ Youtube ]]";
  var outputMarkdown = "Drum and Bass\n\n[[ Youtube ]]\n";
  var ast = {
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
  tester(t, {}, inputMarkdown, outputMarkdown, ast);
  t.end();
});

test("test inline level shortcode without attributes", function(t) {
  var inputMarkdown = "Drum and Bass [[ Youtube ]]";
  var outputMarkdown = "Drum and Bass [[ Youtube ]]\n";
  var ast = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "text", value: "Drum and Bass " },
          { type: "shortcode", identifier: "Youtube", attributes: {} }
        ]
      }
    ]
  };
  tester(t, { allowInline: true }, inputMarkdown, outputMarkdown, ast);
  t.end();
});

test("test block level shortcode with attributes", function(t) {
  var inputMarkdown =
    'Drum and Bass\n\n[[ Youtube id=3 share_code="abc" share-code="def" ]]\n\nTest sentence';
  var outputMarkdown =
    'Drum and Bass\n\n[[ Youtube id="3" share_code="abc" share-code="def" ]]\n\nTest sentence\n';
  var ast = {
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
  tester(t, {}, inputMarkdown, outputMarkdown, ast);
  t.end();
});

test("test inline level shortcode with attributes", function(t) {
  var inputMarkdown =
    'Drum and Bass [[ Youtube id=3 share_code="abc" share-code="def" ]] Test sentence';
  var outputMarkdown =
    'Drum and Bass [[ Youtube id="3" share_code="abc" share-code="def" ]] Test sentence\n';
  var ast = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: "Drum and Bass "
          },
          {
            type: "shortcode",
            identifier: "Youtube",
            attributes: { id: "3", share_code: "abc", "share-code": "def" }
          },
          {
            type: "text",
            value: " Test sentence"
          }
        ]
      }      
    ]
  };
  tester(t, { allowInline: true }, inputMarkdown, outputMarkdown, ast);
  t.end();
});

test("test block level shortcode with custom start/end blocks", function(t) {
  var inputMarkdown =
    'Drum and Bass\n\n{{% Youtube id=3 share-code="abc" %}}\n\nTest sentence';
  var outputMarkdown =
    'Drum and Bass\n\n{{% Youtube id="3" share-code="abc" %}}\n\nTest sentence\n';
  var ast = {
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
  tester(
    t,
    { startBlock: "{{%", endBlock: "%}}" },
    inputMarkdown,
    outputMarkdown,
    ast
  );
  t.end();
});

test("test block level shortcode with custom start/end blocks", function(t) {
  var inputMarkdown =
    'Drum and Bass {{% Youtube id=3 share-code="abc" %}} Test sentence';
  var outputMarkdown =
    'Drum and Bass {{% Youtube id="3" share-code="abc" %}} Test sentence\n';
  var ast = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: "Drum and Bass "
          },
          {
            type: "shortcode",
            identifier: "Youtube",
            attributes: { id: "3", "share-code": "abc" }
          },
          {
            type: "text",
            value: " Test sentence"
          }
        ]
      }
    ]
  };
  tester(
    t,
    { startBlock: "{{%", endBlock: "%}}", allowInline: true },
    inputMarkdown,
    outputMarkdown,
    ast
  );
  t.end();
});

test("test multiple block level shortcodes", function(t) {
  var inputMarkdown =
    '[[ Youtube id=3 ]]\n\nDrum and Bass\n\n[[ Vimeo id="4" ]]';
  var outputMarkdown =
    '[[ Youtube id="3" ]]\n\nDrum and Bass\n\n[[ Vimeo id="4" ]]\n';
  var ast = {
    type: "root",
    children: [
      {
        type: "shortcode",
        identifier: "Youtube",
        attributes: { id: "3" }
      },
      {
        type: "paragraph",
        children: [{ type: "text", value: "Drum and Bass" }]
      },
      {
        type: "shortcode",
        identifier: "Vimeo",
        attributes: { id: "4" }
      }
    ]
  };
  tester(t, {}, inputMarkdown, outputMarkdown, ast);
  t.end();
});

test("test multiple inline level shortcodes", function(t) {
  var inputMarkdown =
    '[[ Youtube id=3 ]] Drum and Bass [[ Vimeo id="4" ]]';
  var outputMarkdown =
    '[[ Youtube id="3" ]] Drum and Bass [[ Vimeo id="4" ]]\n';
  var ast = {
    type: "root",
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: "shortcode",
            identifier: "Youtube",
            attributes: { id: "3" }
          },
          {
            type: "text",
            value: " Drum and Bass "
          },
          {
            type: "shortcode",
            identifier: "Vimeo",
            attributes: { id: "4" }
          }
        ]
      }
    ]
  };
  tester(t, { allowInline: true }, inputMarkdown, outputMarkdown, ast);
  t.end();
});

test("test attributes with equals in value", function(t) {
  var inputMarkdown =
    'Drum and Bass\n\n[[ Youtube href="https://youtube.com?q=test" ]]';
  var outputMarkdown =
    'Drum and Bass\n\n[[ Youtube href="https://youtube.com?q=test" ]]\n';
  var ast = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Drum and Bass" }]
      },
      {
        type: "shortcode",
        identifier: "Youtube",
        attributes: { href: "https://youtube.com?q=test" }
      }
    ]
  };
  tester(t, {}, inputMarkdown, outputMarkdown, ast);
  t.end();
});
