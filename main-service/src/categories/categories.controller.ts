import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import PermissionGuard from 'src/authentication/guards/permission.guard';
import PostsPermission from 'src/posts/enum/postsPermission.enum';
import RequestWithUser from '../authentication/requestWithUser.interface';
import MongooseClassSerializerInterceptor from '../utils/mongooseClassSerializer.interceptor';
import ParamsWithId from '../utils/paramsWithId';
import CategoriesService from './categories.service';
import { Category } from './category.schema';
import CategoryDto from './dto/category.dto';

@Controller('categories')
@UseInterceptors(MongooseClassSerializerInterceptor(Category))
export default class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async getCategory(@Param() { id }: ParamsWithId) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionGuard(PostsPermission.DeletePost))
  async createCategory(
    @Body() category: CategoryDto,
    @Req() req: RequestWithUser,
  ) {
    return this.categoriesService.create(category, req.user);
  }

  @Delete(':id')
  async deleteCategory(@Param() { id }: ParamsWithId) {
    return this.categoriesService.delete(id);
  }

  @Put(':id')
  async updateCategory(
    @Param() { id }: ParamsWithId,
    @Body() category: CategoryDto,
  ) {
    return this.categoriesService.update(id, category);
  }
}
