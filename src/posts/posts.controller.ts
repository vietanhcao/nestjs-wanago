import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { QueryParse } from 'src/common/client-query/client-query.type';
import Role from '../authentication/enum/role.enum';
// import PermissionGuard from '../authentication/guards/permission.guard';
import RoleGuard from '../authentication/guards/role.guard';
import RequestWithUser from '../authentication/requestWithUser.interface';
import JwtTwoFactorGuard from '../authentication/twoFactor/jwt-two-factor.guard';
import Resolve from '../common/helpers/Resolve';
import { ExceptionsLoggerFilter } from '../utils/exceptionsLogger.filter';
import ParamsWithId from '../utils/paramsWithId';
import PostDto from './dto/post.dto';
import UpdatePostDto from './dto/updatePost.dto';
// import PostsPermission from './enum/postsPermission.enum';
import PostsService from './posts.service';

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
  async getAllPosts(
    // @Query() { startId }: PaginationParams,
    @Query('searchQuery') searchQuery: string,
    @Query('search') search: string,
    @Query() query,
  ) {
    if (search) {
      // hide elastic search
      // return this.postsService.searchForPosts(search, skip, limit);
    }
    const { result, pagination } = await this.postsService.findAll(
      null,
      searchQuery,
      null,
      query,
    );
    return Resolve.ok(0, 'Success', result, { pagination });
  }

  /**
   * @private: chỉ có thể được xem bởi người đó
   */
  @Get('me')
  @UseGuards(RoleGuard(Role.User))
  async getAllPostsByUser(
    // @Query() { startId }: PaginationParams,
    @Query('searchQuery') searchQuery: string,
    @Query('search') search: string,
    @Req() req: RequestWithUser,
    @Query() query: QueryParse,
  ) {
    if (search) {
      // hide elastic search
      // return this.postsService.searchForPosts(search, skip, limit);
    }
    const { result, pagination } = await this.postsService.findAll(
      null,
      searchQuery,
      req.user,
      query,
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
  @UseGuards(JwtTwoFactorGuard) // use two-factor authentication
  async createPost(@Body() post: PostDto, @Req() req: RequestWithUser) {
    await this.postsService.create(post, req.user);
    return Resolve.ok(0, 'Success');
  }

  @Delete(':id')
  // @UseGuards(PermissionGuard(PostsPermission.DeletePost))
  @UseGuards(JwtTwoFactorGuard)
  async deletePost(@Param() { id }: ParamsWithId, @Req() req: RequestWithUser) {
    await this.postsService.delete(id, req.user);
    return Resolve.ok(0, 'Success');
  }

  @Put(':id') // meaning update all filed
  @UseGuards(JwtTwoFactorGuard)
  async updatePost(
    @Param() { id }: ParamsWithId,
    @Body() post: UpdatePostDto,
    @Req() req: RequestWithUser,
  ) {
    await this.postsService.update(id, post, req.user);
    return Resolve.ok(0, 'Success');
  }

  @Patch(':id') // meaning update partial filed
  @UseGuards(JwtTwoFactorGuard)
  async updatePostByPatch(
    @Param() { id }: ParamsWithId,
    @Body() post: UpdatePostDto,
    @Req() req: RequestWithUser,
  ) {
    await this.postsService.update(id, post, req.user);
    return Resolve.ok(0, 'Success');
  }
}
