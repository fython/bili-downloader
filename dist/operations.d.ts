import { VideoAudioPair, VideoPartTask, VideoPlayUrlTask, VideoTask } from './model';
import { AudioQuality, VideoQuality } from './apis/constants';
import ExcelJS from 'exceljs';
import { FfmpegCommand } from 'fluent-ffmpeg';
export declare function mapToVideoParts(): (source: VideoTask[]) => Promise<VideoPartTask[]>;
export declare function mapToVideoPlayUrls(preferVideoQuality?: VideoQuality, preferAudioQuality?: AudioQuality): (source: VideoPartTask[]) => Promise<VideoPlayUrlTask[]>;
export declare function mapVideoTasksToWorkbook(): (source: VideoTask[]) => Promise<ExcelJS.Workbook>;
export declare function filterVideoTasks(filter: (item: VideoTask) => Boolean): (source: VideoTask[]) => Promise<VideoTask[]>;
export declare function filterVideoTasksByWorkbook(bookPath: string): (source: VideoTask[]) => Promise<VideoTask[]>;
export declare function mapVideoPartTasksToWorkbook(): (source: VideoPartTask[]) => Promise<ExcelJS.Workbook>;
export declare function filterVideoPartTasks(filter: (item: VideoPartTask) => Boolean): (source: VideoPartTask[]) => Promise<VideoPartTask[]>;
export declare function filterVideoPartTasksByWorkbook(bookPath: string): (source: VideoPartTask[]) => Promise<VideoPartTask[]>;
export declare function saveWorkbook(outPath: string, overwrite?: boolean): (source: ExcelJS.Workbook) => Promise<boolean>;
export declare function downloadTasks(dirPath: string): (source: VideoPlayUrlTask[]) => Promise<VideoAudioPair[]>;
export declare function downloadPartTasks(dirPath: string, preferVideoQuality?: number, preferAudioQuality?: number): (source: VideoPartTask[]) => Promise<VideoAudioPair[]>;
export declare function downloadVideoTasks(dirPath: string, preferVideoQuality?: number, preferAudioQuality?: number): (source: VideoTask[]) => Promise<VideoAudioPair[]>;
export declare function mergeVideoAndAudio(chain?: (ffmpeg: FfmpegCommand) => FfmpegCommand): (source: VideoAudioPair[]) => Promise<void>;
