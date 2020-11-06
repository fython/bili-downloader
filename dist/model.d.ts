import { VideoQuality, AudioQuality } from './apis/constants';
export interface VideoTask {
    bv: string;
    title: string;
}
export interface VideoPartTask {
    root: VideoTask;
    cid: number;
    name: string;
}
export interface VideoPlayUrlTask {
    root: VideoPartTask;
    videoQuality: VideoQuality;
    audioQuality: AudioQuality;
    videoUrl: string[];
    audioUrl: string[];
}
export interface VideoAudioPair {
    videoPath: string;
    audioPath: string;
}
