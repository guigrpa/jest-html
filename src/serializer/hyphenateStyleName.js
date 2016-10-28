const MS_PATTERN = /^ms-/;
const UPPERCASE_PATTERN = /([A-Z])/g;

const hyphenate = (string) =>
  string.replace(UPPERCASE_PATTERN, '-$1').toLowerCase();

const hyphenateStyleName = (string) =>
  hyphenate(string).replace(MS_PATTERN, '-ms-');

export default hyphenateStyleName;
