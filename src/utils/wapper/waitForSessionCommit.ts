import { ClientSession } from 'mongoose';

/**
 * Khi transaction commit sẽ chạy vào func trong hàm này
 * @param func
 * @param oldSession
 */
export const waitForSessionCommit = async (
  func: () => Promise<void> | void,
  oldSession?: ClientSession,
) => {
  if (!oldSession) {
    func();
  } else {
    oldSession.addListener('ended', async (session: ClientSession) => {
      if (session.transaction.isCommitted) await func();
    });
  }
};
