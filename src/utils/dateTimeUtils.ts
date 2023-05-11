export function dateStr(): string {
    let date = new Date();
    let y = '' + date.getFullYear();
    let m = '' + (date.getMonth() + 1);
    if (date.getMonth() + 1 < 10) {
        m = '0' + m;
    }
    let d = '' + date.getDate();
    if (date.getDate() < 10) {
        d = '0' + d;
    }
    return y + m + d;
}

export function timeStr(): string {
    let date = new Date();
    let h = '' + date.getHours();
    if (date.getHours() < 10) {
        h = '0' + h;
    }
    let mm = '' + date.getMinutes();
    if (date.getMinutes() < 10) {
        mm = '0' + mm;
    }
    let s = '' + date.getSeconds();
    if (date.getSeconds() < 10) {
        s = '0' + s;
    }
    return h + mm + s;
}

export function dateTimeStr(): string {
    let date = new Date();
    let y = '' + date.getFullYear();
    let m = '' + (date.getMonth() + 1);
    if (date.getMonth() + 1 < 10) {
        m = '0' + m;
    }
    let d = '' + date.getDate();
    if (date.getDate() < 10) {
        d = '0' + d;
    }
    let h = '' + date.getHours();
    if (date.getHours() < 10) {
        h = '0' + h;
    }
    let mm = '' + date.getMinutes();
    if (date.getMinutes() < 10) {
        mm = '0' + mm;
    }
    let s = '' + date.getSeconds();
    if (date.getSeconds() < 10) {
        s = '0' + s;
    }
    return y + m + d + '_' + h + mm + s;
}
