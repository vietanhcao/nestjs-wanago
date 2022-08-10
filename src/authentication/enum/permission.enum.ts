import CategoriesPermission from '../../categories/enum/categoriesPermission.enum';
import LocalFilePermission from '../../local-files/enum/localFilePermission.enum';
import PostsPermission from '../../posts/enum/postsPermission.enum';

const Permission = {
  ...PostsPermission,
  ...CategoriesPermission,
  ...LocalFilePermission,
};

type Permission = PostsPermission | CategoriesPermission | LocalFilePermission;

export default Permission;
