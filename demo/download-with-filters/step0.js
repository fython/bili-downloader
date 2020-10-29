const {BiliDownloader} = require('../../dist');
const {saveWorkbook, mapVideoTasksToWorkbook} = require('../../dist/operations');

BiliDownloader.getUserVideos(375504219)
    .then(mapVideoTasksToWorkbook())
    .then(saveWorkbook('./data/videos.xlsx'))
    .then(() => console.log('Saved to videos.xlsx'));
