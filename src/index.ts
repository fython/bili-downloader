import {VideoPlayUrlTask, VideoTask} from './model';
import BilibiliApi from './apis';
import fs from 'fs';
import fetch from 'node-fetch';

function bytesToMBytesText(n: number): string {
    return `${(n/1024/1024).toFixed(2)}MB`;
}

function bytesToSpeedText(n: number): string {
    if (n < 1024) {
        return `${n}B/s`;
    } else if (n < 1024 * 1024) {
        return `${(n/1024).toFixed(2)}KB/s`;
    } else {
        return `${(n/1024/1024).toFixed(2)}MB/s`;
    }
}

function percentText(current: number, max: number): string {
    return `${(current/max*100).toFixed(2)}%`;
}

export interface BiliDownloaderInitOptions {
    cookie: string;
    debug?: boolean;
}

export class BiliDownloader {
    static api: BilibiliApi = new BilibiliApi();

    static init(options: BiliDownloaderInitOptions): BiliDownloader {
        BiliDownloader.api.cookie = options.cookie;
        BiliDownloader.api.debug = options.debug ?? false;
        return BiliDownloader;
    }

    static getUserVideos(uid: number): Promise<VideoTask[]> {
        return BiliDownloader.api.getUserVideos(uid)
            .then(page => page.videos.map(video => ({
                bv: video.bvid,
                title: video.title
            } as VideoTask)));
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
            let bpsCalcInterval = setInterval(() => {
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

    static async downloadPlayUrl(task: VideoPlayUrlTask, videoOutPath: string, audioOutPath: string) {
        const bv = task.root.root.bv;
        console.log(`Task[${bv}] Start downloading`);

        const videoRes = await fetch(task.videoUrl[0], BiliDownloader.api.mergeHeaders({
            'Referer': `https://www.bilibili.com/video/${bv}`,
        }));
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
                    `(${percentText(written, length)} ${bytesToSpeedText(bps)})` +
                    '\x1B[0G'
                );
            });
            process.stdout.write(`Finished downloading video part of ${bv} (${videoLengthText})\n`);
        }

        const audioRes = await fetch(task.audioUrl[0], BiliDownloader.api.mergeHeaders({
            'Referer': `https://www.bilibili.com/video/${bv}`,
        }));
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
                    `(${percentText(written, length)} ${bytesToSpeedText(bps)})` +
                    '\x1B[0G'
                );
            });
            process.stdout.write(`Finished downloading audio part of ${bv} (${audioLengthText})\n`);
        }

        console.log(`Task[${bv}] Finished.`);
    }
}
