export enum ApproveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ApproveActions {
  CREATE_CATEGORY = 'CREATE_CATEGORY',
  // UPDATE_MEMBER = 'UPDATE_MEMBER',
  // DELETE_MEMBER = 'DELETE_MEMBER',

  // UPDATE_RISK_PARAMS = 'UPDATE_RISK_PARAMS',
  // ATTACH_COMMODITY = 'ATTACH_COMMODITY',
  // SHARING_RATE = 'SHARING_RATE',

  // MEMBER_WITHDRAW = 'MEMBER_WITHDRAW',
  // ADMIN_ATTACH_FN_MEMBER = 'ADMIN_ATTACH_FN_MEMBER',
  // ADMIN_ATTACH_ROLE_MEMBER = 'ADMIN_ATTACH_ROLE_MEMBER',
}

export const ApproveConfigs = {
  [ApproveActions.CREATE_CATEGORY]: {
    description: 'Phê duyệt tạo category',
    accepted: `APPROVED_CREATE_CATEGORY`,
    rejected: `REJECTED_CREATE_CATEGORY`,
  },
};

export interface IApproved {
  action: ApproveActions;

  approveId: string;

  modifiedBy: string;
}
