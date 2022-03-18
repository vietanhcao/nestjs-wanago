import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import * as mongoose from 'mongoose';
import { FilterQuery, Model } from 'mongoose';
import ClientQuery from 'src/common/client-query';
import { User } from '../users/schema/user.schema';
import { GET_POSTS_CACHE_KEY } from './cache/postsCacheKey.constant';
import { PostDto } from './dto/post.dto';
import UpdatePostDto from './dto/updatePost.dto';
import PostNotFoundException from './exception/postNotFund.exception';
import { Post, PostDocument } from './post.schema';
import PostsSearchService from './postsSearch.service';

@Injectable()
class PostsService {
  private readonly logger = new Logger(PostsService.name);
  public postClientQuery: ClientQuery<PostDocument>;
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly postsSearchService: PostsSearchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.postClientQuery = new ClientQuery(this.postModel);
  }

  async clearCache() {
    const keys: string[] = await this.cacheManager.store.keys();
    keys.forEach((key) => {
      if (key.startsWith(GET_POSTS_CACHE_KEY)) {
        this.cacheManager.del(key);
      }
    });
  }

  /**
   * Lấy ra danh sách các bài viết có trong cache
   * @param skip
   * @param limit
   * @param startId
   */
  async findAll(
    documentsToSkip = 0,
    limitOfDocuments?: number,
    startId?: string,
    searchQuery?: string,
    user?: User,
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

    if (user) {
      filters.author = user;
    }
    // const findQuery = this.postModel
    //   .find(filters)
    //   .sort({ _id: 1 })
    //   .skip(+documentsToSkip)
    //   .populate([
    //     { path: 'author', select: '-password -__v' }, // exclude password
    //     { path: 'categories' }, //"populate" returning the data of the author along with the post.
    //     { path: 'series' },
    //     { path: 'file' },
    //   ])
    //   .lean(); // to skip instantiating a full Mongoose document.
    // if (+limitOfDocuments) {
    //   findQuery.limit(limitOfDocuments);
    // }
    const { result, pagination } = await this.postClientQuery.findForQuery(
      {
        filter: filters,
        limit: limitOfDocuments,
        offset: documentsToSkip,
        sort: { _id: 1 },
      },
      {
        populate: [
          { path: 'author', select: 'lastName firstName -_id' }, // exclude password
          // { path: 'categories' }, //"populate" returning the data of the author along with the post.
          // { path: 'series' },
          { path: 'file' },
        ],
        queryMongoose: filters,
        omit: ['categories', 'title', '__v', 'createdAt', 'updatedAt'],
      },
    );
    // const results = await response;
    // const count = await this.postModel.find(filters).countDocuments();
    return { result, pagination };
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findById(id)
      .select('_id file content')
      .populate([
        { path: 'author', select: 'lastName firstName -_id' }, // exclude password
        { path: 'file' },
      ]);
    if (!post) {
      this.logger.warn('Tried to access a post that does not exist');
      throw new PostNotFoundException(id);
    }
    // post.id = post._id.toString();
    return post;
  }

  async create(postData: PostDto, author: User) {
    const createdPost = new this.postModel({
      ...postData,
      author,
    });
    await createdPost.populate(['categories', 'series']); // query include execPopulate method show data categories and series
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
    await this.findOne(id);
    // if (updatedPost) {
    //   await this.postsSearchService.update(updatedPost);
    //   return updatedPost;
    // }
    await this.clearCache();
    throw new PostNotFoundException(id);
  }

  async update(id: string, postData: UpdatePostDto, author: User) {
    // put do this
    // .findByIdAndUpdate(id, postData)
    // .setOptions({ overwrite: true, new: true })
    const post = await this.postModel
      //update partial
      .updateOne({ _id: id, author }, postData, { new: true })
      .populate('author')
      .populate('categories')
      .populate('series');
    if (!post) {
      throw new NotFoundException();
    }
    // if (post) {
    //   await this.postsSearchService.update(post);
    //   return post;
    // }
    await this.clearCache();
    return post;
  }
  async delete(postId: string, author: User) {
    const result = await this.postModel.findOneAndDelete({
      _id: postId,
      author,
    });
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
