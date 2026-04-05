import { db } from '@/core/database';
import { Interceptor } from '@/core/extensions';
import { parseJikeFollowingResponse } from '@/modules/jike-shared';
import logger from '@/utils/logger';

export const JikeFollowingInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/1\.0\/personalUpdate\/followingUpdates(?:\?|$)/.test(req.url)) {
    return;
  }

  try {
    const { posts, itemCount, typeCounts } = parseJikeFollowingResponse(res.responseText);

    if (posts.length > 0) {
      void db.extAddJikePosts(ext.name, posts);
      logger.info(`JikeFollowing: ${posts.length} posts captured`);
      return;
    }

    logger.warn('JikeFollowing: Matched response but extracted 0 posts', {
      url: req.url,
      itemCount,
      typeCounts,
    });
  } catch (err) {
    logger.debug(req.method, req.url, req.body, res.status, res.responseText);
    logger.errorWithBanner('JikeFollowing: Failed to parse API response', err as Error);
  }
};
