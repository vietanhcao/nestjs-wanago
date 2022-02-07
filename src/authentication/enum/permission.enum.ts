import CategoriesPermission from 'src/categories/enum/categoriesPermission.enum';
import PostsPermission from 'src/posts/enum/postsPermission.enum';

const Permission = {
  ...PostsPermission,
  ...CategoriesPermission,
};

type Permission = PostsPermission | CategoriesPermission;

export default Permission;
