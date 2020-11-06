import { VideoPlayUrlTask, VideoTask } from './model';
import BilibiliApi from './apis';
import { VideoQuality, AudioQuality } from './apis/constants';
import { IdHolder } from './apis/interfaces';
interface BiliDownloaderInitOptions {
    cookie: string;
    debug?: boolean;
}
declare class BiliDownloader {
    static api: BilibiliApi;
    static init(options: BiliDownloaderInitOptions): BiliDownloader;
    /**
     * 获取某一个用户的所有视频并构建任务
     *
     * @param uid 用户空间 ID
     */
    static getUserVideos(uid: number): Promise<VideoTask[]>;
    static getVideo(id: IdHolder): Promise<VideoTask[]>;
    /**
     * 获取某一个收藏列表的所有视频并构建任务
     *
     * @param mid 收藏列表 ID
     */
    static getFavListVideos(mid: number): Promise<VideoTask[]>;
    private static bodyStreamToOut;
    static downloadPlayUrl(task: VideoPlayUrlTask, videoOutPath: string, audioOutPath: string): Promise<void>;
}
export { BiliDownloaderInitOptions, BiliDownloader, AudioQuality, VideoQuality, };
