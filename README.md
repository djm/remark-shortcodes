# remark-shortcodes [![NPM Package][npm-package-badge]][npm-package] [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

A custom Markdown syntax parser for [**remark**][remark] that adds support for shortcodes.

**_What are shortcodes?_** They are a way to provide hooks for macros and/or
template partials inside a markdown file. They consist of start & end blocks,
in between which the shortcode has a name defined and an optional set of
key:value attributes in HTML style. They can look like this:

```markdown
The example below uses the default start & end blocks that
this parser ships with:

[[ MailchimpForm id="chfk2" ]]

But they are configurable, so if you're coming from Hugo say,
you can set them as such:

{{< MailchimpForm id="chfk2" >}}
```

**_Why use them?_** Because sometimes you'd like to insert content inline
without copy pasting raw HTML in to your Markdown file. The copy paste
approach means that hard-to-modify code is littered throughout your
content and is therefore very hard to maintain; whereas the shortcode
approach can result in a partial being updated in only one place.

Both [Wordpress][wordpress-shortcodes] & [Hugo][hugo-shortcodes] have
support for shortcodes; this parser's implementation is much closer
to Wordpress's, as it does not support inner content or nested shortcodes
like Hugo does - but can actually be used for the simpler partials. It
was made for my use, but if you'd like to extend it to support more cases,
please feel free! Everyone is welcome.

## Not a transformer

This is just the parser component; it allows [remark][remark] to understand
the shortcodes at the block level and convert them to a representation
in its Markdown AST (MDAST). The representation is as follows:

```js
{
  type: "shortcode",
  data: {
    name: "MailchimpForm",
    attributes: { id: "chfk2" }
  }
}
```

To transform this into to HTML via providing your own templates
will require something more specific to your project. If you are
using Gatsby, or you'd like to see an implementation of a transformer,
please see the [gatsby-remark-shortcodes][gatsby-remark-shortcodes] repo.

## Installation

[npm][npm]:

```bash
npm install --save remark-shortcodes
```

## Usage

Say `example.js` looks as follows:

```javascript
var unified = require('unified');
var parse = require('remark-parse');
var shortcodes = require('remark-shortcodes');

var markdown = 'Example paragraph\n\n{{> MailchimpForm id="chfk2" <}}'

var tree = unified()
  .use(parse)
  // Plugin inserted below, with custom options for start/end blocks.
  .use(shortcodes, {startBlock: "{{>", endBlock: "<}}"})
  // Turn off position output for legibility below.
  .data('settings', {position: false})
  .parse(markdown);

console.dir(tree, {depth: null});
```

Running `node example` yields:

```js
{
  type: "root",
  children: [
    {
      type: "paragraph",
      children: [{ type: "text", value: "Example paragraph" }]
    },
    {
      type: "shortcode",
      identifier: "MailchimpForm",
      attributes: { id: "chfk2" }
    }
  ]
}
```

## API

### `remark.use(shortcodes, {options})`

Where options support the keys:

- `startBlock`: the start block to look for. Default: `[[`.
- `endBlock`: the end block to look for. Default: `]]`.

NB: Be careful when using custom start/end blocks, your choices
may clash with other markdown syntax and/or other remark plugins.

## Testing

To run the tests, run:

    npm run test-code

To run build, tests & coverage, run:

    npm run test

## Releasing

TravisCI releases on tag to npm & github releases.

- Bump version in package.json
- Commit and tag with version number (`git tag -a v0.1.x -m v0.1.x`)
- Push

## License

[MIT](LICENSE) © [Darian Moody](http://djm.org.uk)

With thanks to [woorm][woorm] et. al for [**remark**][remark].

<!-- Links -->

[npm-package-badge]: https://img.shields.io/npm/v/remark-shortcodes.svg

[npm-package]: https://www.npmjs.org/package/remark-shortcodes

[travis-badge]: https://img.shields.io/travis/djm/remark-shortcodes/master.svg

[travis]: https://travis-ci.org/djm/remark-shortcodes

[codecov-badge]: https://img.shields.io/codecov/c/github/djm/remark-shortcodes.svg

[codecov]: https://codecov.io/github/djm/remark-shortcodes

[wordpress-shortcodes]: https://codex.wordpress.org/shortcode

[hugo-shortcodes]: https://gohugo.io/content-management/shortcodes/

[gatsby-remark-shortcodes]: https://gitub.com/djm/gatsby-remark-shortcodes

[npm]: https://docs.npmjs.com/cli/install

[remark]: https://github.com/wooorm/remark

[woorm]: https://github.com/wooorm
