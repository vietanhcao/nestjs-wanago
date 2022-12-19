import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Model } from 'mongoose';
import ClientQuery from 'src/common/client-query/client-query';
import { QueryParse } from 'src/common/client-query/client-query.type';
import { ServiceApproveService } from 'src/service-approve/service-approve.service';
import { ApproveActions } from 'src/service-approve/types';
import { User } from '../users/schema/user.schema';
import { Category, CategoryDocument } from './category.schema';
import CategoryDto from './dto/category.dto';
import { CategoryStatus } from './types';

@Injectable()
class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,

    private readonly approveService: ServiceApproveService,
  ) {}

  /**
   * A method that fetches the categories from the database
   * @returns A promise with the list of categories
   */
  async findAll(query: QueryParse) {
    const client = new ClientQuery(this.categoryModel);
    const response = await client.findForQuery(query, {
      populate: [
        { path: 'author', select: 'email' },
        { path: 'modifiedBy', select: 'email' },
      ],
    });

    return { ...response, result: response.hits };
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).populate('author');
    if (!category) {
      throw new NotFoundException();
    }
    return category;
  }

  /**
   *  Creates a new category pendding and wating for approval
   * @param categoryData
   * @param author
   * @returns
   */
  async create(categoryData: CategoryDto, author: User) {
    // có thể test transaction ở đây
    const createdCategory = await this.categoryModel.create({
      ...categoryData,
      author,
    });

    const newData = {
      ...categoryData,
      _id: createdCategory._id,
      modifiedBy: author,
    };

    //- Tạo yêu cầu phê duyệt tạo mới category
    await this.approveService.create({
      action: ApproveActions.CREATE_CATEGORY,
      newData,
      oldData: newData,
      createdBy: author._id.toString(),
    });
    return createdCategory;
  }
  /**
   * Phê duyệt tạo mới category
   * @param id
   * @param updatedBy
   * @returns
   */
  public async approvalCategoryCreate(
    _id: string,
    newData: { [key: string]: unknown },
  ) {
    const updated = await this.categoryModel.findOneAndUpdate(
      { _id },
      { $set: { status: CategoryStatus.ACTIVE, ..._.omit(newData, ['_id']) } },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Không tìm thấy category');
    }

    return updated;
  }

  // todo update approve
  async update(id: string, categoryData: CategoryDto) {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, categoryData)
      .setOptions({ overwrite: true, new: true });
    if (!category) {
      throw new NotFoundException();
    }
    return category;
  }

  /**
   * A method that deletes a category from the database
   * @param categoryId An id of a category. A category with this id should exist in the database
   */
  async delete(categoryId: string) {
    const result = await this.categoryModel.findByIdAndDelete(categoryId);
    if (!result) {
      throw new NotFoundException();
    }
  }
}

export default CategoriesService;
