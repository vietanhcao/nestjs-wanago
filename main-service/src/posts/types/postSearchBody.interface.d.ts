import { ObjectId } from 'mongoose';
interface PostSearchBody {
  id: ObjectId;
  title: string;
  content: string;
  authorId: ObjectId;
}

export default PostSearchBody;
