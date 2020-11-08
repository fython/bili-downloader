bili-downloader
======

自用的简陋的 B 站视频批量下载工具。

注：这不是一个完整的应用程序/命令行工具，而是一个 Node.js 库，你需要了解 JavaScript/TypeScript 语言来使用它。

## 安装

```shell script
npm i @siubeng/bili-downloader
```

## 目前支持的功能

- 批量获取用户所有视频任务、批量获取收藏列表所有视频任务
- 导出视频任务、分 P 任务到 XLSX 格式
- 根据导出的 XLSX 过滤下载任务，Chosen 栏为 0 时跳过下载
- 选择视频清晰度、音频清晰度进行下载完整文件（Dash）
- 调用 FFMpeg 合并 Dash 音视频，支持调整参数（使用 [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)）
- [TO-DO 列表](https://github.com/fython/bili-downloader/projects/1)

## 使用样例

`bili-downloader` 的基本使用过程是：

1. 调用 `BiliDownloader` 类的获取用户视频或收藏列表视频构建成一批视频任务。
2. 调用 `operations` 包内的 map（转换）和 filter（过滤）方法构建下载流水线。
3. 调用 `operations` 包内的 `downloadTasks` 启动下载流程。

`operations` 包含的函数众多，目前仅打算自用，后续会继续完善，可能会频繁更改接口，暂不提供文档了。

### 下载一个用户的所有视频

```javascript
const {BiliDownloader, VideoQuality} = require('@siubeng/bili-downloader');
const {
    mapToVideoParts,
    mapToVideoPlayUrls,
} = require('@siubeng/bili-downloader/dist/operations');

// 使用你的 B 站登录 Cookie 来获得更高清晰度或者私密收藏列表
BiliDownloader.init({ cookie: 'MY_COOKIE' });
BiliDownloader.getUserVideos(375504219)
    .then(mapToVideoParts())
    .then(mapToVideoPlayUrls(VideoQuality.$1080p60))
    .then(downloadTasks('D:\\Downloads\\Videos'));
```

## Licenses

MIT
