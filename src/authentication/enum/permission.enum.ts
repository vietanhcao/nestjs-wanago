import CategoriesPermission from 'src/categories/enum/categoriesPermission.enum';
import LocalFilePermission from 'src/local-files/enum/localFilePermission.enum';
import PostsPermission from 'src/posts/enum/postsPermission.enum';

const Permission = {
  ...PostsPermission,
  ...CategoriesPermission,
  ...LocalFilePermission,
};

type Permission = PostsPermission | CategoriesPermission | LocalFilePermission;

export default Permission;
