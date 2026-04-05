import { db } from '@/core/database';
import { Interceptor } from '@/core/extensions';
import { parseJikePostListResponse } from '@/modules/jike-shared';
import logger from '@/utils/logger';

export const JikeExploreInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/1\.0\/recommendFeed\/list(?:\?|$)/.test(req.url)) {
    return;
  }

  try {
    const { posts, dataKeys } = parseJikePostListResponse(res.responseText);

    if (posts.length > 0) {
      void db.extAddJikePosts(ext.name, posts);
      logger.info(`JikeExplore: ${posts.length} posts captured`);
      return;
    }

    logger.warn('JikeExplore: Matched response but extracted 0 posts', {
      url: req.url,
      dataKeys,
    });
  } catch (err) {
    logger.debug(req.method, req.url, req.body, res.status, res.responseText);
    logger.errorWithBanner('JikeExplore: Failed to parse API response', err as Error);
  }
};
