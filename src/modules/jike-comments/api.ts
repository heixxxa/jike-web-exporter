import { db } from '@/core/database';
import { Interceptor } from '@/core/extensions';
import { parseJikeCommentsResponse } from '@/modules/jike-shared';
import logger from '@/utils/logger';

export const JikeCommentsInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/1\.0\/comments\/listPrimary(?:\?|$)/.test(req.url)) {
    return;
  }

  try {
    const { comments, itemCount, dataKeys } = parseJikeCommentsResponse(res.responseText, req.body);

    if (comments.length > 0) {
      void db.extAddJikeComments(ext.name, comments);
    }

    if (itemCount === 0) {
      logger.warn('JikeComments: Matched response but extracted 0 comments', {
        url: req.url,
        dataKeys,
      });
      return;
    }

    logger.info(`JikeComments: ${comments.length} comments captured`);
  } catch (err) {
    logger.debug(req.method, req.url, req.body, res.status, res.responseText);
    logger.errorWithBanner('JikeComments: Failed to parse API response', err as Error);
  }
};
