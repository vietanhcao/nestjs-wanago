// import { Request, Response, Router } from 'express';
// import Controller from '../../interfaces/controller.interface';
// import PostsService from './posts.service';
// import CreatePostDto from './dto/createPost.dto';
// import UpdatePostDto from './dto/updatePost.dto';

// export default class PostsController implements Controller {
//   private path = '/posts';
//   public router = Router();
//   private postsService = new PostsService();

//   constructor() {
//     this.intializeRoutes();
//   }

//   intializeRoutes() {
//     this.router.get(this.path, this.getAllPosts);
//     this.router.get(`${this.path}/:id`, this.getPostById);
//     this.router.post(this.path, this.createPost);
//     this.router.put(`${this.path}/:id`, this.replacePost);
//   }

//   private getAllPosts = (request: Request, response: Response) => {
//     const posts = this.postsService.getAllPosts();
//     response.send(posts);
//   };

//   private getPostById = (request: Request, response: Response) => {
//     const id = request.params.id;
//     const post = this.postsService.getPostById(Number(id));
//     response.send(post);
//   };

//   private createPost = (request: Request, response: Response) => {
//     const post: CreatePostDto = request.body;
//     const createdPost = this.postsService.createPost(post);
//     response.send(createdPost);
//   };

//   private replacePost = (request: Request, response: Response) => {
//     const id = request.params.id;
//     const post: UpdatePostDto = request.body;
//     const replacedPost = this.postsService.replacePost(Number(id), post);
//     response.send(replacedPost);
//   };

//   private deletePost = (request: Request, response: Response) => {
//     const id = request.params.id;
//     this.postsService.deletePost(Number(id));
//     response.sendStatus(200);
//   };
// }
