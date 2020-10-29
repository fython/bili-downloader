export const DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/85.0.4183.121 Safari/537.36";

export enum VideoQuality {
    $240p = 6,
    $360p = 16,
    $480p = 32,
    $720p = 63,
    $720p60 = 74,
    $1080p = 80,
    $1080p_high = 112,
    $1080p60 = 116,
    $4k = 120,
}

export enum AudioQuality {
    $64k = 30216,
    $132k = 30232,
    $192k = 30280,
}
