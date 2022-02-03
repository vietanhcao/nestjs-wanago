import { Module, CacheModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PostsController from './posts.controller';
import PostsService from './posts.service';
import { Post, PostSchema } from './post.schema';
import PostsSearchService from './postsSearch.service';
import { SearchModule } from 'src/search/search.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    SearchModule,
    CacheModule.register({
      ttl: 5,
      max: 100,
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsSearchService],
  exports: [PostsService], // export to another module used
})
class PostsModule {}

export default PostsModule;
