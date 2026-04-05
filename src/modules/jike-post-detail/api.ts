import { db } from '@/core/database';
import { Interceptor } from '@/core/extensions';
import { parseJikePostDetailResponse } from '@/modules/jike-shared';
import logger from '@/utils/logger';

export const JikePostDetailInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/1\.0\/originalPosts\/get(?:\?|$)/.test(req.url)) {
    return;
  }

  try {
    const post = parseJikePostDetailResponse(res.responseText);

    if (post) {
      void db.extAddJikePosts(ext.name, [post]);
      logger.info('JikePostDetail: 1 post captured');
    }
  } catch (err) {
    logger.debug(req.method, req.url, req.body, res.status, res.responseText);
    logger.errorWithBanner('JikePostDetail: Failed to parse API response', err as Error);
  }
};
