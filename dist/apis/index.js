"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const node_fetch_1 = __importDefault(require("node-fetch"));
function _query(params) {
    return new URLSearchParams(params).toString();
}
function _idToQuery(id) {
    return id.bv !== undefined ? { bvid: id.bv } : { aid: String(id.av) };
}
class BilibiliApi {
    constructor() {
        this.debug = false;
        this.userAgent = constants_1.DEFAULT_USER_AGENT;
        this.cookie = process.env.BILIBILI_COOKIE;
    }
    mergeHeaders(extraHeaders) {
        const headers = {};
        headers['User-Agent'] = this.userAgent;
        headers['Referer'] = 'https://www.bilibili.com';
        if (this.cookie) {
            headers['Cookie'] = this.cookie;
        }
        if (extraHeaders) {
            for (const [key, value] of Object.entries(extraHeaders)) {
                headers[key] = value;
            }
        }
        return headers;
    }
    _getUserVideos(mid, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://api.bilibili.com/x/space/arc/search?' +
                _query({ mid: `${mid}`, pn: `${page}`, ps: `${limit}` });
            if (this.debug) {
                console.log(`fetch: GET ${url}`);
            }
            const res = yield node_fetch_1.default(url, { headers: this.mergeHeaders() })
                .then(res => res.json());
            return res.data;
        });
    }
    getUserVideos(mid) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 100;
            let page = 1;
            let data = yield this._getUserVideos(mid, page, limit);
            const result = {
                tags: Object.values(data.list.tlist),
                videos: data.list.vlist
            };
            while (data.page.count > page * limit) {
                page += 1;
                data = yield this._getUserVideos(mid, page, limit);
                for (const tag of Object.values(data.list.tlist)) {
                    if (!result.tags.some(item => item.tid === tag.tid)) {
                        result.tags.push(tag);
                    }
                }
                result.videos.push(...data.list.vlist);
            }
            return result;
        });
    }
    getVideoInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://api.bilibili.com/x/web-interface/view?'
                + _query(_idToQuery(id));
            const res = yield node_fetch_1.default(url, { headers: this.mergeHeaders() })
                .then(res => res.json());
            if (res.code === 0) {
                return res.data;
            }
            else {
                throw new Error(res.message);
            }
        });
    }
    getVideoPagesList(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://api.bilibili.com/x/player/pagelist?' + _query(_idToQuery(id));
            const res = yield node_fetch_1.default(url, { headers: this.mergeHeaders() })
                .then(res => res.json());
            if (res.code === 0) {
                return res.data.map(item => {
                    item.ids = id;
                    return item;
                });
            }
            else {
                throw new Error(res.message);
            }
        });
    }
    getVideoPlayUrl(id, cid) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://api.bilibili.com/x/player/playurl?' +
                _query(Object.assign(Object.assign({}, _idToQuery(id)), { cid: `${cid}`, fnval: '16', fnver: '0', fourk: '1' }));
            const res = yield node_fetch_1.default(url, { headers: this.mergeHeaders() })
                .then(res => res.json());
            if (res.code === 0) {
                return res.data;
            }
            else {
                throw new Error(res.message);
            }
        });
    }
    _getFavListVideos(mid, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://api.bilibili.com/x/v3/fav/resource/list?' +
                _query({ media_id: `${mid}`, pn: `${page}`, ps: `${limit}` });
            if (this.debug) {
                console.log(`fetch: GET ${url}`);
            }
            const res = yield node_fetch_1.default(url, { headers: this.mergeHeaders() })
                .then(res => res.json());
            return res.data;
        });
    }
    getFavListVideos(mid) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 20;
            let page = 1;
            let data = yield this._getFavListVideos(mid, page, limit);
            const result = data;
            while (data.info.media_count > page * limit) {
                page += 1;
                data = yield this._getFavListVideos(mid, page, limit);
                result.medias.push(...data.medias);
            }
            return result;
        });
    }
}
exports.default = BilibiliApi;
