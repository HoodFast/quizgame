import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";

export enum ERRORS_CODE {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  FORBIDDEN = 403,
  ERROR = 500,
}

export class InterlayerNotice<D = null> {
  public data: D | null = null;
  public extensions: InterlayerNoticeExtension[];
  public code = 0;

  constructor(data: D | null = null) {
    this.data = data;
    this.extensions = [];
  }

  public addData(data: D): void {
    this.data = data;
  }
  public addError(
    message: string,
    key: string | null = null,
    code: number | null = null,
  ): void {
    this.code = code ?? 1;
    this.extensions.push(new InterlayerNoticeExtension(message, key));
  }
  public hasError(): boolean {
    return this.code !== 0;
  }
  public exception() {
    if (this.code === 0) return;
    const message = this.extensions[0].message;
    switch (this.code) {
      case ERRORS_CODE.BAD_REQUEST:
        throw new BadRequestException(message);
      case ERRORS_CODE.NOT_FOUND:
        throw new NotFoundException(message);
      case ERRORS_CODE.UNAUTHORIZED:
        throw new UnauthorizedException(message);
      case ERRORS_CODE.FORBIDDEN:
        throw new ForbiddenException(message);
      case ERRORS_CODE.ERROR:
        throw new Error(message);
      default:
        throw new Error();
    }
  }
}

export class InterlayerNoticeExtension {
  public readonly message: string;
  public readonly key: string | null;
  constructor(message: string, key: string | null = null) {
    this.message = message;
    this.key = key;
  }
}
