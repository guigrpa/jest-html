import gift from 'gift';

// ---------------------------------
// Git
// ---------------------------------
let lastCommit;  // eslint-disable-line no-unused-vars
let lastCommitTree;

const gitInit = (story) => gitRefreshLastCommit(story);

const gitRefreshLastCommit = (story) => new Promise((resolve, reject) => {
  const repo = gift(process.cwd());
  repo.current_commit((err, commit) => {
    if (err) {
      story.warn('extractor', 'No git repo, snapshot diffing will be disabled');
      lastCommit = null;
      lastCommitTree = null;
      reject(new Error('GIT_COMMIT_NOT_FOUND'));
      return;
    }
    story.info('extractor', 'Git repo found, will use it for snapshot diffing');
    lastCommit = commit;
    lastCommitTree = commit.tree();
    resolve(commit);
  });
});

const gitChild = (tree, childName, story) => new Promise((resolve, reject) => {
  tree.contents((err, things) => {
    const thing = things.find((o) => o.name === childName);
    if (thing == null) {
      story.info('extractor', `Could not find '${childName}' inside '${tree.name}'`, { attach: things });
    }
    resolve(thing);
  });
});

const gitCommittedFile = async (filePath, story) => {
  if (lastCommitTree == null) throw new Error('GIT_COMMIT_NOT_FOUND');
  const segments = filePath.split('/');
  let curThing = lastCommitTree;
  for (let i = 0; i < segments.length; i++) {
    story.warn('extractor', `Reading node ${segments[i]}`);
    // const prevThing = curThing;
    curThing = await gitChild(curThing, segments[i], story);
    if (curThing == null) {
      story.warn('extractor', `Could not find node ${filePath}`);
      return null;
    }
  }
  const data = await gitBlobData(curThing);
  return data;
};

const gitBlobData = (blob) => new Promise((resolve) => {
  blob.data((err, data) => {
    if (err) {
      resolve(null);
      return;
    }
    resolve(data);
  });
});

const example = async () => {
  try {
    const commit = await gitRefreshLastCommit(mainStory);
    console.log(commit.id);
    const data = await gitCommittedFile('src/previewer.js', mainStory);
    console.log(data.length);
    const data2 = await gitCommittedFile('src/previewer.jssdfsdfsfsdfsdfsf', mainStory);
    console.log(data2);
    const data3 = await gitCommittedFile('test/setup.js', mainStory);
    console.log(data3.length);
    const data4 = await gitCommittedFile('test/exampleSnapshots/a/080-settings.test.js.snap', mainStory);
    console.log(data4.length);
    const data5 = await gitCommittedFile('test/exampleSnapshots/a/éxtra/060-translator.test.js.snap', mainStory);
    console.log(!!data5);
    const data6 = await gitCommittedFile('test/exampleSnapshots/with spaces/050-header spaces.test.js.snap', mainStory);
    console.log(!!data6);
  } catch (err) {
    console.error(err);
  }
};

example();
