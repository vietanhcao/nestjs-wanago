import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as assert from 'assert';
import * as bcrypt from 'bcrypt';
import _ from 'lodash';
import { Model } from 'mongoose';
import { UpdateAccountFunctionsDto } from './dtos/rbac-user.dto';
import { RbacUser, RbacUserDocument } from './schema/rbac-user.schema';
import { RbacUserTypes } from './types/rbac-user.enum';

@Injectable()
export class RbacUserService {
  constructor(
    @InjectModel(RbacUser.name) private rbacUserModel: Model<RbacUserDocument>,
  ) {}

  /**
   * Func tạo mới tài khoản đăng nhập
   * API dành cho nội bộ
   * @param username
   * @param email
   * @returns
   */
  async createAccountForDev(username: string, email: string) {
    Logger.log('[createMemberAccount] Start dto', username);

    const password = this.generatePassword();
    const hash = await bcrypt.hash(password, 10);
    await this.rbacUserModel.create({
      username,
      password: hash,
      type: RbacUserTypes.MEMBER_EMPLOYEE,
      email,
    });

    return { username, password };
  }

  /**
   * Tạo mật khẩu ngẫu nhiên
   * @returns
   */
  private generatePassword() {
    return (Math.random() + 1).toString(36).substring(3);
  }

  /**
   * Trả về thông tin quyền và roles
   * @param username
   * @returns
   */
  async findFunctionsRolesforUsername(username: string) {
    const rbacUser = await this.findRbacUserForUsername(username);
    return _.omit(rbacUser.toJSON(), ['password', '__v']);
  }

  /**
   * Trả về quyền và nhóm quyền theo user name
   * @param username
   */
  async findRbacUserForUsername(username: string) {
    const rbacUser = await this.rbacUserModel.findOne({ username });
    assert.ok(rbacUser, new NotFoundException('Không tìm thấy rbac admin'));

    return rbacUser;
  }

  /**
   * Kiểm tra thông tin tài khoản đã tồn tại hay chưa
   * @param username
   */
  async validateRbacAccount(username: string) {
    const rbac = await this.rbacUserModel.findOne({ username });
    assert.ok(!rbac, new NotFoundException('tài khoản đã tồn tại'));

    return true;
  }

  /**
   * Kiểm tra thông tin email đã tồn tại
   * @param username
   */
  async validateRbacEmail(email: string) {
    const rbac = await this.rbacUserModel.findOne({
      email: email.toLowerCase().trim(),
    });
    if (rbac) throw new NotFoundException('email đã tồn tại');

    return true;
  }

  /**
   * Thực hiện khi inactive một tài khoản
   * @param username
   */
  async lockAccount(dto) {
    const account = await this.rbacUserModel.updateOne(
      { username: dto.username },
      { $set: { status: dto.status } },
      { new: true },
    );

    assert.ok(account, new NotFoundException('Không tìm thấy rbac admin'));
    return account;
  }

  /**
   * Gắn quyền lẻ cho tài khoản
   * @param dto
   */
  async updateFunctionsForAccount(dto: UpdateAccountFunctionsDto) {
    const rbacUser = await this.rbacUserModel.updateOne(
      {
        username: dto.username,
        type: RbacUserTypes.MEMBER_EMPLOYEE,
      },
      { $set: { functions: dto.functions } },
      { new: true },
    );
    assert.ok(rbacUser, new NotFoundException('Không tìm thấy rbac admin'));
    return dto;
  }
}
