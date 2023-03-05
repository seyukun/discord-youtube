export function getInfo({ url }: {
    url: any;
}): Promise<false | {
    videoDetails: any;
    formats: any;
}>;
export function getVideoId({ url }: {
    url: any;
}): any;
