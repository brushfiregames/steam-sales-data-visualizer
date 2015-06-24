var fs = require('fs');
var execSync = require('child_process').execSync;

var deployDir = __dirname + '/deploy';

// Helper to get rid of directories for us
deleteFolderRecursive = function(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      }
      else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

// Ensure we start fresh for every deploy
deleteFolderRecursive(deployDir);

// Parse the current repositories origin URL
var remoteUrl = execSync('git config --get remote.origin.url').toString().trim();

// Do a shallow clone of the repository's gh-pages branch into a "deploy" directory and remove everything.
execSync('git clone --depth 1 --branch gh-pages --single-branch ' + remoteUrl + ' "' + deployDir + '"');
execSync('git -C "' + deployDir + '" rm -r "*"');

// Run the deploy task using Gulp to build the site into the deploy directory.
execSync('node_modules/.bin/gulp deploy');
execSync('git -C "' + deployDir + '" add .');

// Get the current commit of the branch to use in our commit message
var hash = execSync("git log --pretty=format:'%h' -n 1").toString().trim();
execSync('git -C "' + deployDir + '" commit -am "Deploying commit ' + hash + '."');

// Push the deploy directory
execSync('git -C "' + deployDir + '" push');
