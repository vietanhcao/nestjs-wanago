import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import JwtTwoFactorGuard from 'src/authentication/twoFactor/jwt-two-factor.guard';
import { QueryParse } from 'src/common/client-query/client-query.type';
import Resolve from 'src/common/helpers/Resolve';
import PermissionGuard from '../authentication/guards/permission.guard';
import RequestWithUser from '../authentication/requestWithUser.interface';
import MongooseClassSerializerInterceptor from '../utils/mongooseClassSerializer.interceptor';
import ParamsWithId from '../utils/paramsWithId';
import CategoriesService from './categories.service';
import { Category } from './category.schema';
import CategoryDto from './dto/category.dto';
import CategoriesPermission from './enum/categoriesPermission.enum';

@Controller('categories')
@UseInterceptors(MongooseClassSerializerInterceptor(Category))
export default class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @UseGuards(JwtTwoFactorGuard)
  async getAllCategories(@Query() query: QueryParse) {
    const { result, pagination } = await this.categoriesService.findAll(query);
    return Resolve.ok(0, 'Success', result, { pagination });
  }

  @Get(':id')
  async getCategory(@Param() { id }: ParamsWithId) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(PermissionGuard(CategoriesPermission.CreateCategory))
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
