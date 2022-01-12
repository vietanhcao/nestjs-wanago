import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import PostSearchResult from './types/postSearchResponse.interface';
import PostSearchBody from './types/postSearchBody.interface';
import { Post } from './post.schema';

@Injectable()
export default class PostsSearchService {
  index = 'posts';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexPost(post: Post) {
    return this.elasticsearchService.index<PostSearchResult, PostSearchBody>({
      index: this.index,
      body: {
        id: post._id,
        title: post.title,
        content: post.content,
        authorId: post.author._id,
      },
    });
  }

  async search(text: string) {
    const { body } = await this.elasticsearchService.search<PostSearchResult>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['title', 'content'],
          },
        },
      },
    });
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }

  async remove(postId: string) {
    this.elasticsearchService.deleteByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: postId,
          },
        },
      },
    });
  }

  async update(post: Post) {
    const newBody: PostSearchBody = {
      id: post._id,
      title: post.title,
      content: post.content,
      authorId: post.author._id,
    };

    const script = Object.entries(newBody).reduce((result, [key, value]) => {
      return `${result} ctx._source.${key}='${value}';`;
    }, '');

    return this.elasticsearchService.updateByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: post._id,
          },
        },
        script: {
          inline: script,
        },
      },
    });
  }
}
