const {BiliDownloader, VideoQuality} = require('../../dist');
const {
    downloadTasks,
    mapToVideoPlayUrls,
    filterVideoTasksByWorkbook,
    mapToVideoParts,
    mergeVideoAndAudio
} = require('../../dist/operations');

BiliDownloader.init({ cookie: process.env.BILIBILI_COOKIE });
BiliDownloader.getUserVideos(375504219)
    .then(filterVideoTasksByWorkbook('./data/videos.xlsx'))
    .then(mapToVideoParts())
    .then(mapToVideoPlayUrls(VideoQuality.$480p))
    .then(downloadTasks('./data/video'))
    .then(mergeVideoAndAudio());
