import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './category.schema';
import { NotFoundException } from '@nestjs/common';
import CategoryDto from './dto/category.dto';
import { User } from '../users/schema/user.schema';

@Injectable()
class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * A method that fetches the categories from the database
   * @returns A promise with the list of categories
   */
  async findAll() {
    return this.categoryModel.find().populate('author');
    // return this.categoryModel.find();
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).populate('author');
    if (!category) {
      throw new NotFoundException();
    }
    return category;
  }

  create(categoryData: CategoryDto, author: User) {
    const createdCategory = new this.categoryModel({
      ...categoryData,
      author,
    });
    return createdCategory.save();
  }

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
