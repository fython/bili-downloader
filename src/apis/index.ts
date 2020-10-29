import {DEFAULT_USER_AGENT} from "./constants";
import {IdHolder, Tag, UserVideosResult, Video, VideoPage, VideoPlayUrlInfo} from "./interfaces";
import fetch from 'node-fetch';

interface UserVideosRawPage {
    list: {
        tlist: Record<string, Tag>;
        vlist: Video[];
    };
    page: {
        pn: number;
        ps: number;
        count: number;
    };
}

interface ApiResult<T> {
    code: number;
    message: string;
    ttl: number;
    data: T;
}

function _query(params: Record<string, string>): string {
    return new URLSearchParams(params).toString();
}

function _idToQuery(id: IdHolder): Record<string, string> {
    return id.bv !== undefined ? { bvid: id.bv } : { aid: String(id.av) };
}

export default class BilibiliApi {
    debug: boolean;
    userAgent: string;
    cookie?: string;

    constructor() {
        this.debug = false;
        this.userAgent = DEFAULT_USER_AGENT;
        this.cookie = process.env.BILIBILI_COOKIE as (string | undefined);
    }

    mergeHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
        const headers: Record<string, string> = {};
        headers["User-Agent"] = this.userAgent;
        headers["Referer"] = "https://www.bilibili.com";
        if (this.cookie) {
            headers["Cookie"] = this.cookie;
        }
        if (extraHeaders) {
            for (const [key, value] of Object.entries(extraHeaders)) {
                headers[key] = value;
            }
        }
        return headers;
    }

    private async _getUserVideos(mid: number, page: number, limit: number): Promise<UserVideosRawPage> {
        const url = "https://api.bilibili.com/x/space/arc/search?" +
            _query({ mid: `${mid}`, pn: `${page}`, ps: `${limit}` });
        if (this.debug) {
            console.log(`fetch: GET ${url}`);
        }
        const res = await fetch(url, { headers: this.mergeHeaders() })
            .then(res => res.json()) as ApiResult<UserVideosRawPage>;
        return res.data;
    }

    async getUserVideos(mid: number): Promise<UserVideosResult> {
        const limit = 100;
        let page = 1;
        let data = await this._getUserVideos(mid, page, limit);
        let result: UserVideosResult = {
            tags: Object.values(data.list.tlist),
            videos: data.list.vlist
        };
        while (data.page.count > page * limit) {
            page += 1;
            data = await this._getUserVideos(mid, page, limit);
            for (const tag of Object.values(data.list.tlist)) {
                if (!result.tags.some(item => item.tid === tag.tid)) {
                    result.tags.push(tag);
                }
            }
            result.videos.push(...data.list.vlist);
        }
        return result;
    }

    async getVideoPagesList(id: IdHolder): Promise<VideoPage[]> {
        const url = "https://api.bilibili.com/x/player/pagelist?" + _query(_idToQuery(id));
        const res = await fetch(url, { headers: this.mergeHeaders() })
            .then(res => res.json()) as ApiResult<VideoPage[]>;
        if (res.code === 0) {
            return res.data.map(item => {
                item.ids = id;
                return item;
            });
        } else {
            throw new Error(res.message);
        }
    }

    async getVideoPlayUrl(id: IdHolder, cid: number): Promise<VideoPlayUrlInfo> {
        const url = "https://api.bilibili.com/x/player/playurl?" +
            _query({ ..._idToQuery(id),
                cid: `${cid}`, fnval: '16', fnver: '0', fourk: '1' });
        const res = await fetch(url, { headers: this.mergeHeaders() })
            .then(res => res.json()) as ApiResult<VideoPlayUrlInfo>;
        if (res.code === 0) {
            return res.data;
        } else {
            throw new Error(res.message);
        }
    }
}
