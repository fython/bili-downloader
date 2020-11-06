import {VideoPlayUrlTask, VideoTask} from './model';
import BilibiliApi from './apis';
import {VideoQuality, AudioQuality} from './apis/constants';
import {IdHolder} from './apis/interfaces';
import fs from 'fs';
import fetch from 'node-fetch';
import {bytesToMBytesText, bytesToSpeedText, percentText} from './utils';

interface BiliDownloaderInitOptions {
    cookie: string;
    debug?: boolean;
}

class BiliDownloader {
    static api: BilibiliApi = new BilibiliApi();

    static init(options: BiliDownloaderInitOptions): BiliDownloader {
        BiliDownloader.api.cookie = options.cookie;
        BiliDownloader.api.debug = options.debug ?? false;
        return BiliDownloader;
    }

    /**
     * 获取某一个用户的所有视频并构建任务
     *
     * @param uid 用户空间 ID
     */
    static getUserVideos(uid: number): Promise<VideoTask[]> {
        return BiliDownloader.api.getUserVideos(uid)
            .then(page => page.videos.map(video =>
                ({ bv: video.bvid, title: video.title })
            ));
    }

    static getVideo(id: IdHolder): Promise<VideoTask[]> {
        return BiliDownloader.api.getVideoInfo(id)
            .then(info => [
                { bv: info.bvid, title: info.title },
            ]);
    }

    /**
     * 获取某一个收藏列表的所有视频并构建任务
     *
     * @param mid 收藏列表 ID
     */
    static getFavListVideos(mid: number): Promise<VideoTask[]> {
        return BiliDownloader.api.getFavListVideos(mid)
            .then(list => list.medias.map(video =>
                ({ bv: video.bvid, title: video.title })
            ));
    }

    private static async bodyStreamToOut(res: fetch.Response,
                                         out: fs.WriteStream,
                                         onProgress: (written: number, bps: number) => void) {
        await new Promise((resolve, reject) => {
            const body = res.body;
            if (!body) {
                reject(new Error('No body'));
                return;
            }

            let written = 0, lastWritten = 0, bps = 0;
            const interval = 1000;
            const bpsCalcInterval = setInterval(() => {
                bps = (written - lastWritten) * (1000 / interval);
                lastWritten = written;
            }, interval);
            body.on('error', err => {
                clearInterval(bpsCalcInterval);
                reject(err);
            });
            body.on('finish', () => {
                clearInterval(bpsCalcInterval);
                resolve();
            });
            body.on('data', (data) => {
                out.write(data, () => {
                    written += data.length;
                    onProgress(written, bps);
                });
            });
        });
    }

    static async downloadPlayUrl(task: VideoPlayUrlTask, videoOutPath: string, audioOutPath: string): Promise<void> {
        const bv = task.root.root.bv;
        console.log(`Task[${bv}] Start downloading`);

        const headers = BiliDownloader.api.mergeHeaders({
            'Referer': `https://www.bilibili.com/video/${bv}`,
        });
        const videoRes = await fetch(task.videoUrl[0], { headers });
        if (!videoRes.ok) {
            throw new Error(`Cannot get segment file: ${task.videoUrl[0]}`);
        }
        const videoLength = Number(videoRes.headers.get('Content-Length'));
        const videoLengthText = bytesToMBytesText(videoLength);
        if (fs.existsSync(videoOutPath) && fs.statSync(videoOutPath).size === videoLength) {
            console.log(`Task[${bv}] ${videoOutPath} was downloaded.`);
        } else {
            console.log(`Task[${bv}] Downloading video file. Total size: ${videoLengthText}`);
            const videoOut = fs.createWriteStream(videoOutPath);
            await BiliDownloader.bodyStreamToOut(videoRes, videoOut, (written, bps) => {
                const writtenText = bytesToMBytesText(written);
                process.stdout.write(
                    `Progress: ${writtenText} of ${videoLengthText} ` +
                    `(${percentText(written, videoLength)} ${bytesToSpeedText(bps)})` +
                    '\x1B[0G'
                );
            });
            process.stdout.write(`Finished downloading video part of ${bv} (${videoLengthText})\n`);
        }

        const audioRes = await fetch(task.audioUrl[0], { headers });
        if (!audioRes.ok) {
            throw new Error(`Cannot get segment file: ${task.audioUrl[0]}`);
        }
        const audioLength = Number(audioRes.headers.get('Content-Length'));
        const audioLengthText = bytesToMBytesText(audioLength);
        if (fs.existsSync(audioOutPath) && fs.statSync(audioOutPath).size === audioLength) {
            console.log(`Task[${bv}] ${audioOutPath} was downloaded.`);
        } else {
            console.log(`Task[${bv}] Downloading audio file. Total size: ${audioLengthText}`);
            const audioOut = fs.createWriteStream(audioOutPath);
            await BiliDownloader.bodyStreamToOut(audioRes, audioOut, (written, bps) => {
                const writtenText = bytesToMBytesText(written);
                process.stdout.write(
                    `Progress: ${writtenText} of ${audioLengthText} ` +
                    `(${percentText(written, audioLength)} ${bytesToSpeedText(bps)})` +
                    '\x1B[0G'
                );
            });
            process.stdout.write(`Finished downloading audio part of ${bv} (${audioLengthText})\n`);
        }

        console.log(`Task[${bv}] Finished.`);
    }
}

export {
    BiliDownloaderInitOptions,
    BiliDownloader,
    AudioQuality,
    VideoQuality,
};
