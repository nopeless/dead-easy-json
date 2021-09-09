const { execSync } = require(`child_process`);

try {
  execSync(`git diff-index --quiet HEAD --`);
} catch (e) {
  throw new Error(`working tree is not clean`);
}
try {
  // tbf idk even why i made this
  const p = require(`../package.json`);
  const version = `v${p.version}`;
  execSync(`npm run ci`);
  const tags = execSync(`git tag --points-at HEAD`).toString().split(`\n`);
  if (tags.includes(version)) {
    execSync(`git tag -d ${version}`);
  }
  execSync(`git tag -a ${version} -m "npm version update to ${version}"`);
  execSync(`git push origin ${version}`);
} catch (e) {
  // console.error(e.stdout.toString(), e.stderr.toString());
  throw 1;
}
