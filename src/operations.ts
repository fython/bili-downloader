import {VideoAudioPair, VideoPartTask, VideoPlayUrlTask, VideoTask} from './model';
import {BiliDownloader} from './index';
import {AudioQuality, VideoQuality} from './apis/constants';
import ExcelJS from 'exceljs';
import Ffmpeg, {FfmpegCommand} from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import {escapeDirName} from './utils';

const VIDEO_TASKS_COLUMNS = [
    { header: 'BV', key: 'bv', width: 10 },
    { header: 'Title', key: 'title', width: 80 },
    { header: 'Chosen', key: 'chosen', width: 6 },
];

const VIDEO_PART_TASKS_COLUMNS = [
    { header: 'BV', key: 'bv', width: 10 },
    { header: 'CID', key: 'cid', width: 15 },
    { header: 'Title', key: 'title', width: 80 },
    { header: 'Part', key: 'part', width: 50 },
    { header: 'Chosen', key: 'chosen', width: 6 },
];

export function mapToVideoParts(): (source: VideoTask[]) => Promise<VideoPartTask[]> {
    const api = BiliDownloader.api;
    return async (source: VideoTask[]) => {
        const res: VideoPartTask[] = [];
        for (const task of source) {
            const pages = await api.getVideoPagesList({ bv: task.bv });
            res.push(...pages.map(page => ({
                root: task,
                cid: page.cid,
                name: page.part
            })));
        }
        return res;
    };
}

export function mapToVideoPlayUrls(
    preferVideoQuality?: VideoQuality,
    preferAudioQuality?: AudioQuality
): (source: VideoPartTask[]) => Promise<VideoPlayUrlTask[]> {
    const api = BiliDownloader.api;
    const videoQualityPrefer = preferVideoQuality ?? VideoQuality.$4k;
    const audioQualityPrefer = preferAudioQuality ?? AudioQuality.$192k;
    return async (source: VideoPartTask[]) => {
        const res: VideoPlayUrlTask[] = [];
        for (const task of source) {
            const playUrl = await api.getVideoPlayUrl({ bv: task.root.bv }, task.cid);
            const videoSegments = playUrl.dash.video.sort((a, b) => a.id - b.id);
            const audioSegments = playUrl.dash.audio.sort((a, b) => a.id - b.id);
            let preferVideoSegment = playUrl.dash.video[0];
            let preferAudioSegment = playUrl.dash.audio[0];
            for (const seg of videoSegments) {
                if (seg.id <= videoQualityPrefer) {
                    preferVideoSegment = seg;
                }
            }
            for (const seg of audioSegments) {
                if (seg.id <= audioQualityPrefer) {
                    preferAudioSegment = seg;
                }
            }
            res.push({
                root: task,
                videoQuality: preferVideoSegment.id as VideoQuality,
                audioQuality: preferAudioSegment.id as AudioQuality,
                videoUrl: [preferVideoSegment.baseUrl, ...preferVideoSegment.backupUrl],
                audioUrl: [preferAudioSegment.baseUrl, ...preferAudioSegment.backupUrl],
            });
        }
        return res;
    };
}

export function mapVideoTasksToWorkbook(): (source: VideoTask[]) => Promise<ExcelJS.Workbook> {
    return async (source: VideoTask[]) => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'BiliDownloader';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('Tasks');
        sheet.columns = VIDEO_TASKS_COLUMNS as ExcelJS.Column[];
        sheet.addRows(source.map(item => ({
            bv: item.bv,
            title: item.title,
            chosen: 1,
        })));
        return workbook;
    };
}

export function filterVideoTasks(filter: (item: VideoTask) => boolean): (source: VideoTask[]) => Promise<VideoTask[]> {
    return async (source: VideoTask[]) => {
        return source.filter(item => filter(item));
    };
}

export function filterVideoTasksByWorkbook(bookPath: string): (source: VideoTask[]) => Promise<VideoTask[]> {
    return async (source: VideoTask[]) => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(bookPath);
        const sheet = workbook.getWorksheet('Tasks');
        sheet.columns = VIDEO_TASKS_COLUMNS as ExcelJS.Column[];
        const excludedTasks: string[] = [];
        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            if (row.getCell('chosen').value == 0) {
                excludedTasks.push(row.getCell('bv').value as string);
            }
        }
        return source.filter(item => excludedTasks.indexOf(item.bv) < 0);
    };
}

export function mapVideoPartTasksToWorkbook(): (source: VideoPartTask[]) => Promise<ExcelJS.Workbook> {
    return async (source: VideoPartTask[]) => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'BiliDownloader';
        workbook.created = new Date();
        const sheet = workbook.addWorksheet('Tasks');
        sheet.columns = VIDEO_PART_TASKS_COLUMNS as ExcelJS.Column[];
        sheet.addRows(source.map(item => ({
            bv: item.root.bv,
            cid: item.cid,
            title: item.root.title,
            part: item.name,
            chosen: 1,
        })));
        return workbook;
    };
}

export function filterVideoPartTasks(
    filter: (item: VideoPartTask) => boolean
): (source: VideoPartTask[]) => Promise<VideoPartTask[]> {
    return async (source: VideoPartTask[]) => {
        return source.filter(item => filter(item));
    };
}

export function filterVideoPartTasksByWorkbook(
    bookPath: string
): (source: VideoPartTask[]) => Promise<VideoPartTask[]> {
    return async (source: VideoPartTask[]) => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(bookPath);
        const sheet = workbook.getWorksheet('Tasks');
        sheet.columns = VIDEO_PART_TASKS_COLUMNS as ExcelJS.Column[];
        const excludedTasks: string[] = [];
        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            if (row.getCell('chosen').value === '0') {
                const bv = row.getCell('bv').value as string;
                const cid = row.getCell('cid').value as number;
                excludedTasks.push(`${bv}-${cid}`);
            }
        }
        return source.filter(item => `${item.root.bv}-${item.cid}` in excludedTasks);
    };
}

export function saveWorkbook(outPath: string, overwrite?: boolean): (source: ExcelJS.Workbook) => Promise<boolean> {
    return async (source: ExcelJS.Workbook) => {
        if (!overwrite && fs.existsSync(outPath)) {
            throw new Error(`File ${outPath} exists`);
        }
        await source.xlsx.writeFile(outPath);
        return true;
    };
}

export function downloadTasks(dirPath: string): (source: VideoPlayUrlTask[]) => Promise<VideoAudioPair[]> {
    const resolvedPath = path.resolve(dirPath);
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Directory ${resolvedPath} doesn't exist.`);
    }
    return async (source: VideoPlayUrlTask[]) => {
        const pairs: VideoAudioPair[] = [];
        for (const task of source) {
            const bv = task.root.root.bv;
            const title = task.root.root.title;
            const videoPath = path.join(resolvedPath, `${bv}-${escapeDirName(title)}`);
            if (!fs.existsSync(videoPath)) {
                fs.mkdirSync(videoPath);
            }
            const videoFilePath = path.join(videoPath, `${escapeDirName(task.root.name)}.mp4`);
            const audioFilePath = path.join(videoPath, `${escapeDirName(task.root.name)}.m4a`);

            await BiliDownloader.downloadPlayUrl(task, videoFilePath, audioFilePath);

            pairs.push({ videoPath: videoFilePath, audioPath: audioFilePath });
        }
        return pairs;
    };
}

export function downloadPartTasks(
    dirPath: string,
    preferVideoQuality?: number,
    preferAudioQuality?: number
): (source: VideoPartTask[]) => Promise<VideoAudioPair[]> {
    return async (source: VideoPartTask[]) => {
        return await mapToVideoPlayUrls(preferVideoQuality, preferAudioQuality)(source)
            .then(downloadTasks(dirPath));
    };
}

export function downloadVideoTasks(
    dirPath: string,
    preferVideoQuality?: number,
    preferAudioQuality?: number
): (source: VideoTask[]) => Promise<VideoAudioPair[]> {
    return async (source: VideoTask[]) => {
        return await mapToVideoParts()(source)
            .then(mapToVideoPlayUrls(preferVideoQuality, preferAudioQuality))
            .then(downloadTasks(dirPath));
    };
}

export function mergeVideoAndAudio(
    chain?: (ffmpeg: FfmpegCommand) => FfmpegCommand
): (source: VideoAudioPair[]) => Promise<void> {
    return async (source: VideoAudioPair[]) => {
        for (const {videoPath, audioPath} of source) {
            const mergedVideoPath = videoPath.substring(0, videoPath.lastIndexOf('.')) +
                '_merged.' +
                videoPath.substr(videoPath.lastIndexOf('.') + 1);
            if (fs.existsSync(mergedVideoPath)) {
                console.log(`Merged file path exists: ${mergedVideoPath}`);
                continue;
            }
            let cmd = Ffmpeg()
                .addInput(videoPath)
                .addInput(audioPath)
                .withVideoCodec('copy')
                .withAudioCodec('copy')
                .output(mergedVideoPath);
            cmd = chain?.call(null, cmd) || cmd;
            await new Promise((resolve, reject) => {
                cmd.on('start', (cmdLine) => console.log(`FFMpeg with cmdline: ${cmdLine}`));
                cmd.on('progress', (progress) => console.log(`Progressing: ${progress.percent}%`));
                cmd.on('end', () => resolve());
                cmd.on('error', (err) => reject(err));
                cmd.run();
            });
            console.log(`Finished merging video and audio to ${mergedVideoPath}`);
        }
    };
}
