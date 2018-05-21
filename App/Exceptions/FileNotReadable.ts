export class FileNotReadable extends Error {

    systemErrorCode: number;

    constructor(sysErrNum: number = -1) {
        super();
        this.systemErrorCode = sysErrNum;
    }

    toString(): string {
        return "File is not readable. ERR: " + this.systemErrorCode;
    }
}