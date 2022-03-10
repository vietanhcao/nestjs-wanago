import {
  Body,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import PostsService from './posts.service';
import ParamsWithId from '../utils/paramsWithId';
import PostDto from './dto/post.dto';
import JwtAuthenticationGuard from 'src/authentication/token/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { PaginationParams } from 'src/utils/paginationParams';
import { Post as PostModel } from './post.schema';
import MongooseClassSerializerInterceptor from 'src/utils/mongooseClassSerializer.interceptor';
import UpdatePostDto from './dto/updatePost.dto';
import { ExceptionsLoggerFilter } from 'src/utils/exceptionsLogger.filter';
import { GET_POSTS_CACHE_KEY } from './cache/postsCacheKey.constant';
import { HttpCacheInterceptor } from './cache/httpCache.interceptor';
import RoleGuard from 'src/authentication/guards/role.guard';
import Role from 'src/authentication/enum/role.enum';
import PermissionGuard from 'src/authentication/guards/permission.guard';
import PostsPermission from './enum/postsPermission.enum';
import Resolve from 'src/common/helpers/Resolve';

@Controller('posts')
// @UseInterceptors(MongooseClassSerializerInterceptor(PostModel)) //enable to execute class-transformer
export default class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Lấy ra danh sách các bài viết có trong cache
   * @public: có thể được xem bởi mọi người
   */
  @UseGuards(RoleGuard(Role.User))
  // @UseInterceptors(HttpCacheInterceptor)
  // @CacheKey(GET_POSTS_CACHE_KEY)
  // @CacheTTL(120)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true })) // transform: true to active @Type(() => Number)
  async getAllPosts(
    @Query() { skip, limit, startId }: PaginationParams,
    @Query('searchQuery') searchQuery: string,
    @Query('search') search: string,
    @Query() query,
  ) {
    if (search) {
      // hide elastic search
      // return this.postsService.searchForPosts(search, skip, limit);
    }
    const { result, pagination } = await this.postsService.findAll(
      skip,
      limit,
      startId,
      searchQuery,
    );
    return Resolve.ok(0, 'Success', result, { pagination });
  }

  /**
   * @private: chỉ có thể được xem bởi người đó
   */
  @Get('me')
  @UseGuards(RoleGuard(Role.User))
  @UsePipes(new ValidationPipe({ transform: true })) // transform: true to active @Type(() => Number)
  async getAllPostsByUser(
    @Query() { skip, limit, startId }: PaginationParams,
    @Query('searchQuery') searchQuery: string,
    @Query('search') search: string,
    @Req() req: RequestWithUser,
  ) {
    if (search) {
      // hide elastic search
      // return this.postsService.searchForPosts(search, skip, limit);
    }
    const { result, pagination } = await this.postsService.findAll(
      skip,
      limit,
      startId,
      searchQuery,
      req.user,
    );
    return Resolve.ok(0, 'Success', result, { pagination });
  }

  @Get(':id')
  @UseFilters(ExceptionsLoggerFilter) // catch all exception
  async getPost(@Param() { id }: ParamsWithId) {
    const response = await this.postsService.findOne(id);
    return Resolve.ok(0, 'Success', response);
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createPost(@Body() post: PostDto, @Req() req: RequestWithUser) {
    await this.postsService.create(post, req.user);
    return Resolve.ok(0, 'Success');
  }

  @Delete(':id')
  @UseGuards(PermissionGuard(PostsPermission.DeletePost))
  async deletePost(@Param() { id }: ParamsWithId) {
    await this.postsService.delete(id);
    return Resolve.ok(0, 'Success');
  }

  @Put(':id') // meaning update all filed
  @UseGuards(JwtAuthenticationGuard)
  async updatePost(@Param() { id }: ParamsWithId, @Body() post: UpdatePostDto) {
    await this.postsService.update(id, post);
    return Resolve.ok(0, 'Success');
  }

  @Patch(':id') // meaning update partial filed
  @UseGuards(JwtAuthenticationGuard)
  async updatePostByPatch(
    @Param() { id }: ParamsWithId,
    @Body() post: UpdatePostDto,
  ) {
    await this.postsService.update(id, post);
    return Resolve.ok(0, 'Success');
  }
}
