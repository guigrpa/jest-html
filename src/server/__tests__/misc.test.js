const OBJ = {
  just: 'an',
  object: 'with',
  some: 'attributes',
  inIt: { foo: 3, bar: 4 },
};

const MARKDOWN = `
# Title 1

## Title 2

A paragraph with *some* **formatted** text and [a link](http://github.com/guigrpa).

* Some
* Bullets
* There you go!

\`\`\`js
// Some JavaScript
const a = {
  b: 3,
};
\`\`\`

Is everything OK?
`;

describe('miscellaneous', () => {
  it('should correctly show JSON', () => {
    expect(OBJ).toMatchSnapshot();
  });

  it('should correctly show Markdown', () => {
    expect(MARKDOWN).toMatchSnapshot();
  });
})
