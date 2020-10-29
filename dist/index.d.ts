import { VideoPlayUrlTask, VideoTask } from './model';
import BilibiliApi from './apis';
export interface BiliDownloaderInitOptions {
    cookie: string;
    debug?: boolean;
}
export declare class BiliDownloader {
    static api: BilibiliApi;
    static init(options: BiliDownloaderInitOptions): BiliDownloader;
    static getUserVideos(uid: number): Promise<VideoTask[]>;
    private static bodyStreamToOut;
    static downloadPlayUrl(task: VideoPlayUrlTask, videoOutPath: string, audioOutPath: string): Promise<void>;
}
