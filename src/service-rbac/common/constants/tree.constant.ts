import { FUNCTIONS } from './function.constant';

export type RoleTreeType = {
  title: string;
  key?: string | number;
  children?: RoleTreeType[];
};

export const ROLE_TREE = [
  // {
  //   key: 0,
  //   title: 'Quản lý người dùng',
  //   children: [
  //     {
  //       key: 0.1,
  //       title: 'Danh sách người dùng',
  //       children: [
  //         {
  //           title: 'Thiết lập/chỉnh sửa người dùng',
  //           key: MEMBER_FUNCTIONS.FN_MEMBER_EMPLOYEE_CREATE_UPDATE,
  //         },
  //         {
  //           title: 'Lấy danh sách người dùng',
  //           key: MEMBER_FUNCTIONS.FN_MEMBER_EMPLOYEES,
  //         },
  //         {
  //           title: 'Phê duyệt Thiết lập/chỉnh sửa thông tin người dùng',
  //           key: MEMBER_FUNCTIONS.FN_MEMBER_EMPLOYEE_APPROVES,
  //         },
  //         {
  //           title: 'Sửa nhóm quyền của người dùng',
  //           key: MEMBER_FUNCTIONS.FN_MEMBER_EMPLOYEE_UPDATE_ROLE,
  //         },
  //         {
  //           title: 'Chỉnh sửa quyền riêng của người dùng',
  //           key: MEMBER_FUNCTIONS.FN_MEMBER_EMPLOYEE_UPDATE_FUNCTIONS,
  //         },
  //       ],
  //     },

  //     {
  //       key: 0.2,
  //       title: 'Quản lý phòng ban',
  //       children: [
  //         {
  //           title: 'Lấy danh sách phòng ban',
  //           key: MEMBER_FUNCTIONS.FN_MEMBER_DEPARTMENT,
  //         },
  //         {
  //           title: 'Thiết lập/chỉnh sửa phòng ban',
  //           key: MEMBER_FUNCTIONS.FN_MEMBER_DEPARTMENT_CREATE_UPDATE,
  //         },
  //         {
  //           title: 'Phê duyệt Thiết lập/chỉnh sửa thông tin phòng ban',
  //           key: MEMBER_FUNCTIONS.FN_MEMBER_DEPARTMENT_APPROVES,
  //         },
  //       ],
  //     },
  //     {
  //       key: 0.3,
  //       title: 'Quản lý nhóm quyền',
  //       children: [
  //         {
  //           title: 'Lấy danh sách nhóm quyền',
  //           key: MEMBER_FUNCTIONS.FN_MEMBER_ROLES,
  //         },
  //         {
  //           title: 'Thiết lập/chỉnh sửa thông tin nhóm quyền',
  //           key: MEMBER_FUNCTIONS.FN_MEMBER_ROLE_CREATE_UPDATE,
  //         },
  //         {
  //           title: 'Phê duyệt Thiết lập/chỉnh sửa thông tin nhóm quyền',
  //           key: MEMBER_FUNCTIONS.FN_MEMBER_ROLE_APPROVES,
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    key: 1,
    title: 'Quản lý category',
    children: [
      {
        title: 'Tạo mới category',
        key: FUNCTIONS.FN_CREATE_CATEGORY,
      },
    ],
  },
];
