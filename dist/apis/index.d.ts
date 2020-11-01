import { FavListInfo, FavListVideo, IdHolder, UserVideosResult, Video, VideoPage, VideoPlayUrlInfo } from './interfaces';
interface FavListRawPage {
    info: FavListInfo;
    medias: FavListVideo[];
}
export default class BilibiliApi {
    debug: boolean;
    userAgent: string;
    cookie?: string;
    constructor();
    mergeHeaders(extraHeaders?: Record<string, string>): Record<string, string>;
    private _getUserVideos;
    getUserVideos(mid: number): Promise<UserVideosResult>;
    getVideoInfo(id: IdHolder): Promise<Video>;
    getVideoPagesList(id: IdHolder): Promise<VideoPage[]>;
    getVideoPlayUrl(id: IdHolder, cid: number): Promise<VideoPlayUrlInfo>;
    private _getFavListVideos;
    getFavListVideos(mid: number): Promise<FavListRawPage>;
}
export {};
