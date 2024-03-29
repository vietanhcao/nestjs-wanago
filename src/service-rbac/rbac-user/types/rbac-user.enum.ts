export enum RbacUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}

/**
 * dùng khi phê duyệt nhóm quyền hệ thống
 */
export enum ApproveRoleStatus {
  ATTACH_PERMISSION_MEMBER = 'ATTACH_PERMISSION_MEMBER',
  ADMIN_ATTACH_FN_MEMBER = 'ADMIN_ATTACH_FN_MEMBER',
  ADMIN_ATTACH_ROLE_MEMBER = 'ADMIN_ATTACH_ROLE_MEMBER',

  ATTACK_FN_ADMINISTRATOR = 'ATTACK_FN_ADMINISTRATOR',
  ATTACK_ROLE_ADMINISTRATOR = 'ATTACK_ROLE_ADMINISTRATOR',

  MEMBER_ATTACK_FN_EMPLOYEE = 'MEMBER_ATTACK_FN_EMPLOYEE',
  MEMBER_ATTACK_ROLE_EMPLOYEE = 'MEMBER_ATTACK_ROLE_EMPLOYEE',
}

export enum RbacUserTypes {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  MEMBER_EMPLOYEE = 'MEMBER_EMPLOYEE',
}
