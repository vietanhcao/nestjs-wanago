import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchModule } from '../search/search.module';
import { Post, PostSchema } from './post.schema';
import PostsController from './posts.controller';
import PostsService from './posts.service';
import PostsSearchService from './postsSearch.service';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    SearchModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true,
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 120,
      }),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsSearchService],
  exports: [PostsService], // export to another module used
})
class PostsModule {}

export default PostsModule;
