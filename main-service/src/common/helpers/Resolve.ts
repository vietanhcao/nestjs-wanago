export enum STATUS_CODE {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  UNSUPPORTED_ACTION = 405,
  VALIDATION_FAILED = 422,
  SERVER_ERROR = 500,
  CREATED = 201,
  TOO_MANY_REQUESTS = 429,
}

interface JsonResponse {
  body: any;
  options: {
    status: STATUS_CODE;
  };
}

class Resolve {
  public static statusToMsg(status: STATUS_CODE) {
    switch (status) {
      case STATUS_CODE.BAD_REQUEST:
        return 'Bad Request';
      case STATUS_CODE.UNAUTHORIZED:
        return 'Unauthorized';
      case STATUS_CODE.FORBIDDEN:
        return 'Forbidden';
      case STATUS_CODE.NOT_FOUND:
        return 'Not Found';
      case STATUS_CODE.UNSUPPORTED_ACTION:
        return 'Unsupported Action';
      case STATUS_CODE.VALIDATION_FAILED:
        return 'Validation Failed';
      case STATUS_CODE.SERVER_ERROR:
        return 'Internal Server Error';
      case STATUS_CODE.CREATED:
        return 'Created';
      case STATUS_CODE.OK:
        return 'Success';
      case STATUS_CODE.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
    }
  }

  public static jsonResponse({ body, options }: JsonResponse) {
    options.status = options.status || STATUS_CODE.OK;
    return {
      status: options.status,
      ...body,
    };
  }

  public static ok(
    resCode: number,
    description: string,
    data?: any,
    options?: {
      pagination?: {
        totalRows: number;
        totalPages: number;
      };
    },
  ) {
    const { pagination } = options || {};
    const body = {
      resCode,
      description,
      data: data || this.statusToMsg(STATUS_CODE.OK),
    };

    if (pagination) body['pagination'] = pagination;

    return this.jsonResponse({
      body,
      options: { status: STATUS_CODE.OK },
    });
  }
}

export default Resolve;
