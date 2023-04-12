import mongoose, { AnyObject, ClientSession } from 'mongoose';

/**
 * Khởi tạo một transaction (Có thể gửi oldSession cũ vào)
 * @param func
 * @param oldSession
 * @returns
 */
export const withTransaction = async <T>(
  func: (session: ClientSession) => Promise<T>,
  oldSession?: ClientSession,
): Promise<T> => {
  if (oldSession) return await func(oldSession);
  const newSession = await mongoose.connections[1].startSession();

  const transactionOptions = {
    readPreference: { mode: 'primary' },
    readConcern: { level: 'majority' },
    writeConcern: { w: 'majority' },
  } as AnyObject;

  try {
    let res;
    await newSession.withTransaction(async () => {
      res = await func(newSession as ClientSession);
    }, transactionOptions);

    await newSession.commitTransaction();
    return res;
  } catch (error) {
    throw error;
  } finally {
    await newSession.endSession();
  }
};
