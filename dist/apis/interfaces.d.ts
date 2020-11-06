import { AudioQuality, VideoQuality } from './constants';
export interface IdHolder {
    av?: number;
    bv?: string;
}
export interface Tag {
    tid: number;
    count: number;
    name: string;
}
export interface Video {
    comment: number;
    typeid: number;
    play: number;
    pic: string;
    subtitle: string;
    description: string;
    copyright: string;
    title: string;
    review: number;
    author: string;
    mid: number;
    created: number;
    length: string;
    video_review: number;
    aid: number;
    bvid: string;
    hide_click: boolean;
    is_pay: 0 | 1;
    is_union_video: 0 | 1;
}
export interface UserVideosResult {
    tags: Tag[];
    videos: Video[];
}
export interface VideoPage {
    cid: number;
    page: number;
    from: string;
    part: string;
    duration: number;
    vid: string;
    weblink: string;
    dimension: {
        width: number;
        height: number;
        rotate: number;
    };
    ids: IdHolder;
}
export interface VideoPlayUrlInfo {
    from: string;
    quality: VideoQuality;
    format: string;
    timelength: number;
    accept_format: string;
    accept_description: string[];
    accept_quality: VideoQuality[];
    video_codecid: number;
    seek_param: string;
    seek_type: string;
    dash: DashInfo;
    support_formats: VideoFormatInfo[];
}
export interface DashInfo {
    duration: number;
    minBufferTime: number;
    video: SegmentInfo[];
    audio: SegmentInfo[];
}
export interface SegmentInfo {
    id: VideoQuality | AudioQuality;
    baseUrl: string;
    backupUrl: string[];
    bandwidth: number;
    mimeType: string;
    codecs: string;
    width: number;
    height: number;
    frameRate: string;
    sar: string;
    startWithSap: number;
    segment_base: {
        initialization: string;
        index_range: string;
    };
    codecid: number;
}
export interface VideoFormatInfo {
    quality: VideoQuality;
    format: string;
    description: string;
    display_desc: string;
    superscript: string;
}
export interface FavListInfo {
    id: number;
    fid: number;
    mid: number;
    attr: number;
    title: string;
    cover: string;
    upper: {
        mid: number;
        name: string;
        face: string;
    };
    cover_type: number;
    cnt_info: {
        collect: number;
        play: number;
        thumb_up: number;
        share: number;
    };
    type: number;
    intro: string;
    ctime: number;
    mtime: number;
    state: number;
    fav_state: number;
    like_state: number;
    media_count: number;
}
export interface FavListVideo {
    id: number;
    type: number;
    title: string;
    cover: string;
    intro: string;
    page: number;
    duration: number;
    upper: {
        mid: number;
        name: string;
        face: string;
    };
    attr: number;
    cnt_info: {
        collect: number;
        play: number;
        danmaku: number;
    };
    link: string;
    ctime: number;
    pubtime: number;
    fav_time: number;
    bvid: string;
}
