import { Request } from 'express';
import { UserDocument } from '../users/schema/user.schema';

interface RequestWithUser extends Request {
  user: UserDocument;
}

export default RequestWithUser;
