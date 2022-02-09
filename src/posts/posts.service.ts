import { Model, FilterQuery } from 'mongoose';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './post.schema';
import { PostDto } from './dto/post.dto';
import { User } from '../users/user.schema';
import * as mongoose from 'mongoose';
import UpdatePostDto from './dto/updatePost.dto';
import PostNotFoundException from './exception/postNotFund.exception';
import PostsSearchService from './postsSearch.service';
import { Cache } from 'cache-manager';
import { GET_POSTS_CACHE_KEY } from './cache/postsCacheKey.constant';

@Injectable()
class PostsService {
  private readonly logger = new Logger(PostsService.name);
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly postsSearchService: PostsSearchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async clearCache() {
    const keys: string[] = await this.cacheManager.store.keys();
    keys.forEach((key) => {
      if (key.startsWith(GET_POSTS_CACHE_KEY)) {
        this.cacheManager.del(key);
      }
    });
  }

  async findAll(
    documentsToSkip = 0,
    limitOfDocuments?: number,
    startId?: string,
    searchQuery?: string,
  ) {
    const filters: FilterQuery<PostDocument> = startId
      ? {
          _id: {
            $gt: startId,
          },
        }
      : {};

    if (searchQuery) {
      filters.$text = {
        $search: searchQuery,
      };
    }
    const findQuery = this.postModel
      .find(filters)
      .sort({ _id: 1 })
      .skip(+documentsToSkip)
      .populate('author', '-password -__v') // exclude password
      .populate('categories') //"populate" returning the data of the author along with the post.
      .populate('series') //"populate" returning the data of the author along with the post.
      .populate('file'); //"populate" returning the data of the author along with the post.
    if (+limitOfDocuments) {
      findQuery.limit(limitOfDocuments);
    }
    const results = await findQuery;
    const count = await this.postModel.count();

    return { results, count };
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id);
    if (!post) {
      this.logger.warn('Tried to access a post that does not exist');
      throw new PostNotFoundException(id);
    }
    return post;
  }

  async create(postData: PostDto, author: User) {
    const createdPost = new this.postModel({
      ...postData,
      author,
    });
    await createdPost.populate(['categories', 'series']);
    const newPost = await createdPost.save();
    // hide elastic search
    // this.postsSearchService.indexPost(newPost);
    await this.clearCache();
    return newPost;
  }

  async searchForPosts(
    text: string,
    documentsToSkip = 0,
    limitOfDocuments?: number,
  ) {
    const searchResults = await this.postsSearchService.search(text);
    const ids = searchResults.map((result) => result.id);
    if (!ids.length) {
      return [];
    }
    const findQuery = this.postModel
      .find({
        _id: { $in: ids },
      })
      .sort({ _id: 1 })
      .skip(+documentsToSkip)
      .populate('author', '-password -__v') // exclude password
      .populate('categories') //"populate" returning the data of the author along with the post.
      .populate('series'); //"populate" returning the data of the author along with the post.
    if (+limitOfDocuments) {
      findQuery.limit(limitOfDocuments);
    }
    const results = await findQuery;
    const count = await this.postModel.count();
    await this.clearCache();

    return { results, count };
  }

  async deletePost(id: string) {
    const deleteResponse = await this.postModel.findByIdAndDelete(id);
    if (!deleteResponse) {
      throw new PostNotFoundException(id);
    }
    await this.postsSearchService.remove(id);
  }

  async updatePost(id: string, post: UpdatePostDto) {
    await this.postModel.findByIdAndUpdate({ _id: id }, post, {
      new: true,
    });
    const updatedPost = await this.findOne(id);
    if (updatedPost) {
      await this.postsSearchService.update(updatedPost);
      return updatedPost;
    }
    await this.clearCache();
    throw new PostNotFoundException(id);
  }

  async update(id: string, postData: UpdatePostDto) {
    // put do this
    // .findByIdAndUpdate(id, postData)
    // .setOptions({ overwrite: true, new: true })
    const post = await this.postModel
      //update partial
      .findByIdAndUpdate({ _id: id }, postData, { new: true })
      .populate('author')
      .populate('categories')
      .populate('series');
    if (!post) {
      throw new NotFoundException();
    }
    if (post) {
      await this.postsSearchService.update(post);
      return post;
    }
    await this.clearCache();
    return post;
  }
  async delete(postId: string) {
    const result = await this.postModel.findByIdAndDelete(postId);
    if (!result) {
      throw new NotFoundException();
    }
    await this.clearCache();
    return result.id;
  }
  async deleteMany(
    ids: string[],
    session: mongoose.ClientSession | null = null,
  ) {
    await this.clearCache();
    return this.postModel.deleteMany({ _id: ids }).session(session);
  }
}

export default PostsService;
