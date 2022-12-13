import { Model, PipelineStage } from 'mongoose';
import {
  LIMIT_DEFAULT,
  OFFSET_DEFAULT,
  QUERY_MAPPING,
} from './client-query.constant';
import {
  ModelQuery,
  QueryParse,
  QueryAggregate,
  ParseQueryResult,
  PaginationResult,
  ClientQueryOptions,
} from './client-query.type';

export default class ClientQuery<T> {
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
  async findForQuery(
    query: QueryParse,
    options?: ClientQueryOptions<T>,
    isGetAllPagination = false,
  ) {
    const { populate, queryMongoose } = options || {};
    const { filter, limit, offset, sort } = this.parseQuery(query || {});

    //- Lọc dữ liệu theo query và lấy phân trang
    const omit = options?.omit || [];
    const mongoFilter = queryMongoose
      ? { ...filter, ...queryMongoose }
      : filter;

    // isGetAllPagination
    const pagination = await this.getPagination(
      isGetAllPagination ? {} : mongoFilter,
      limit,
    );

    //- Tạo câu query database theo query client
    const results: T[] = await this.model
      .find(mongoFilter)
      .skip(offset)
      .limit(limit)
      .sort(sort)
      .populate(populate)
      .lean();

    return {
      hits: omit.length ? this.omit(results, omit) : results,
      pagination: pagination,
    };
  }

  /**
   * Lấy danh sách bản ghi theo query của `client` gửi lên
   * @param query
   * @param options
   */
  async queryAggregate(query: QueryParse, options?: QueryAggregate) {
    const { filter, limit, offset, sort } = this.parseQuery(query || {});
    const { aggregate, queryFilter } = options || {};

    //- Lọc dữ liệu theo query và lấy phân trang
    const pagination = await this.getPagination(filter, limit);
    const match: PipelineStage[] = [
      { $match: { ...filter, ...queryFilter } },
      ...aggregate,
    ];

    if (Object.keys(sort).length != 0) match.push({ $sort: sort });
    //- Tạo câu query database theo query client
    const data = await this.model.aggregate([
      ...match,
      { $skip: limit * offset },
      { $limit: limit },
    ]);

    return {
      hits: data,
      pagination,
    };
  }

  public parseQuery(query: QueryParse): ParseQueryResult<T> {
    const limit = Number(query.limit) || LIMIT_DEFAULT;
    const offset = Number(query.offset) || OFFSET_DEFAULT;

    //- Xoá 2 key limit và offset ra khỏi query nếu có
    delete query['limit'];
    delete query['offset'];

    const keys = Object.keys(query);
    const config = QUERY_MAPPING;
    const filter = {};
    const sort = {};

    //- Chuyển query sang dạng query của mongoose
    keys.forEach((key) => {
      // Lặp qua các giá trị query filter
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

    //- Chuyển query or sang dạng mongoose
    const or = [];
    Object.keys(filter).map((o) => {
      if (filter[o]['$or']) {
        or.push({ [o]: filter[o]['$or'] });
        delete filter[o];
      }

      if (filter[o] && filter[o]['$regex']) {
        filter[o] = { $regex: filter[o]['$regex'], $options: 'i' };
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
    if (!value || !Array.isArray(value)) return value;

    const omit = (value: T, key: string[]) => {
      const clone = value;
      const keys = Object.keys(clone);

      //- Delete key on key input
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
