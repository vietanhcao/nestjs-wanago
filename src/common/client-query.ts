import { FilterQuery, Model, PopulateOptions, UpdateQuery } from 'mongoose';
import { CONST } from './global/const';

export type ClientQueryOptions<T> = {
  populate?: PopulateOptions | Array<PopulateOptions>;
  omit?: string[];
  queryMongoose?: FilterQuery<T>;
};

export type ModelQuery<T> = UpdateQuery<T> & Record<string, unknown>;

export type QueryParse = {
  [key: string]: string | number | Record<string, unknown>;
};

export type ParseQueryResult<T> = {
  filter: FilterQuery<T>;
  limit: number;
  offset: number;
  sort: string | any;
};

export type PaginationResult = {
  totalRows: number;
  totalPages: number;
};

class ClientQuery<T> {
  public model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Lấy danh sách bản ghi theo `query`. Hàm này giống hàm `find` trong `mongoose`
   */
  async find(query?: ModelQuery<T>) {
    const results = await this.model.find(query);
    return results;
  }

  /**
   * Trả về 1 bản ghi duy nhất thoả mãn điều kiện. Giống hàm `findOne` trong `mongoose`
   */
  async findOne(query?: ModelQuery<T>) {
    const results = await this.model.findOne(query);
    return results;
  }

  /**
   * Lấy danh sách bản ghi theo query của `client` gửi lên
   * @param query
   * @param options
   */
  async findForQuery(query: QueryParse, options?: ClientQueryOptions<T>) {
    const { populate, queryMongoose } = options || {};
    const { filter, limit, offset, sort } = this.parseQuery(query || {});

    // Todo: Lọc dữ liệu theo query và lấy phân trang
    const omit = options?.omit || [];
    const mongoFilter = queryMongoose
      ? { ...filter, ...queryMongoose }
      : filter;
    const pagination = await this.getPagination(mongoFilter, limit);
    // Todo: Tạo câu query database theo query client
    const results = await this.model
      .find(mongoFilter)
      .skip(offset)
      .limit(limit)
      .sort(sort)
      .populate(populate)
      .lean();
    return {
      result: omit.length ? this.omit(results as T[], omit) : results,
      pagination: pagination,
    };
  }

  public parseQuery(query: QueryParse): ParseQueryResult<T> {
    const limit = Number(query.limit) || 20;
    const offset = Number(query.offset) || 0;

    // Todo: Xoá 2 key limit và offset ra khỏi query nếu có
    delete query['limit'];
    delete query['offset'];

    const keys = Object.keys(query);
    const config = CONST.QUERY_CONFIG;
    const filter = {};
    const sort = {};

    // Todo: Chuyển query sang dạng query của mongoose
    keys.forEach((key) => {
      const value = query[key];
      config.forEach((element) => {
        if (typeof value != 'object') return;
        if (value['sort'] == element.key) sort[key] = element.value;
        if (value[element.key]) {
          filter[key] = filter[key]
            ? {
                ...filter[key],
                [element.value]: value[element.key],
              }
            : { [element.value]: value[element.key] };
        }
      });
    });

    // Todo: Chuyển query or sang dạng mongoose
    const or = [];
    Object.keys(filter).map((o) => {
      if (filter[o]['$or']) {
        or.push({ [o]: filter[o]['$or'] });
        delete filter[o];
      }
    });
    if (or && or.length) filter['$or'] = or;

    return {
      filter: filter,
      limit: limit,
      offset: offset,
      sort: sort,
    };
  }

  public omit(value: T[], keys: string[]) {
    if (!value || typeof value != 'object') return value;

    const omit = (value: T, key: string[]) => {
      const clone = value;
      const keys = Object.keys(clone);

      // Todo: Delete key on key input
      for (let k = 0; k <= key.length; k++) {
        for (let e = 0; e <= keys.length; e++) {
          if (keys[e] == key[k]) {
            delete clone[keys[e]];
          }
        }
      }
      return clone;
    };

    const result = [];
    value.map((element) => result.push(omit(element, keys)));
    return result as T[];
  }

  async getPagination(
    filter: ModelQuery<T>,
    limit: number,
  ): Promise<PaginationResult> {
    const count = await this.model.countDocuments(filter);
    const pagination = {
      totalRows: count,
      totalPages: Math.ceil(count / limit),
    };
    return pagination;
  }
}

export default ClientQuery;
