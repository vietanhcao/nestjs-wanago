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
} from '@nestjs/common';
import JwtTwoFactorGuard from 'src/authentication/twoFactor/jwt-two-factor.guard';
import { QueryParse } from 'src/common/client-query/client-query.type';
import Resolve from 'src/common/helpers/Resolve';
import Permission2FaGuard from '../authentication/guards/permission2FA.guard';
import RequestWithUser from '../authentication/requestWithUser.interface';
import ParamsWithId from '../utils/paramsWithId';
import CategoriesService from './categories.service';
import CategoryDto from './dto/category.dto';
import CategoriesPermission from './enum/categoriesPermission.enum';

@Controller('categories')
export default class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @UseGuards(JwtTwoFactorGuard)
  async getAllCategories(@Query() query: QueryParse) {
    const { result, pagination } = await this.categoriesService.findAll(query);
    return Resolve.ok(0, 'Success', result, { pagination });
  }

  @Get(':id')
  @UseGuards(JwtTwoFactorGuard)
  async getCategory(@Param() { id }: ParamsWithId) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtTwoFactorGuard)
  @UseGuards(Permission2FaGuard(CategoriesPermission.CreateCategory))
  async createCategory(
    @Body() category: CategoryDto,
    @Req() req: RequestWithUser,
  ) {
    return this.categoriesService.create(category, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtTwoFactorGuard)
  async deleteCategory(@Param() { id }: ParamsWithId) {
    return this.categoriesService.delete(id);
  }

  @Put(':id')
  @UseGuards(JwtTwoFactorGuard)
  async updateCategory(
    @Param() { id }: ParamsWithId,
    @Body() category: CategoryDto,
  ) {
    return this.categoriesService.update(id, category);
  }
}
