import { IdHolder, UserVideosResult, VideoPage, VideoPlayUrlInfo } from "./interfaces";
export default class BilibiliApi {
    debug: boolean;
    userAgent: string;
    cookie?: string;
    constructor();
    mergeHeaders(extraHeaders?: Record<string, string>): Record<string, string>;
    private _getUserVideos;
    getUserVideos(mid: number): Promise<UserVideosResult>;
    getVideoPagesList(id: IdHolder): Promise<VideoPage[]>;
    getVideoPlayUrl(id: IdHolder, cid: number): Promise<VideoPlayUrlInfo>;
}
