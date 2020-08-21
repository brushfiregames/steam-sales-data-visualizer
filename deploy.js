const { execSync } = require('child_process');

const distDir = `${__dirname}/dist`;

const remoteUrl = execSync('git config --get remote.origin.url')
  .toString()
  .trim();
execSync(
  `git clone --depth 1 --branch gh-pages --single-branch ${remoteUrl} "${distDir}"`
);
execSync(`git -C "${distDir}" rm -r "*"`);
execSync('yarn build');
execSync(`git -C "${distDir}" add .`);
const hash = execSync("git log --pretty=format:'%h' -n 1").toString().trim();
execSync(`git -C "${distDir}" commit -am "Deploying commit ${hash}."`);
// execSync(`git -C "${distDir}" push`);
