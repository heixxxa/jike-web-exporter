import type {
  JikeComment,
  JikeLinkInfo,
  JikePost,
  JikePostBase,
  JikeReferencedPost,
  JikeTopic,
  JikeUser,
} from '@/types/jike';

type AnyRecord = Record<string, unknown>;

function asObject(value: unknown): AnyRecord {
  return value && typeof value === 'object' ? (value as AnyRecord) : {};
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function toStringValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (value == null) {
    return '';
  }

  return String(value);
}

function toNumberValue(value: unknown, fallback = 0) {
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function toBooleanValue(value: unknown) {
  return value === true;
}

function normalizeJikeUrl(url: unknown) {
  return typeof url === 'string' ? url.replace(/^http:\/\//, 'https://').trim() : '';
}

function buildJikePostUrl(postId: string) {
  return postId ? `https://web.okjike.com/originalPost/${postId}` : '';
}

function extractPictureUrl(picture: unknown) {
  const pictureObject = asObject(picture);
  const candidates = [
    pictureObject.picUrl,
    pictureObject.middlePicUrl,
    pictureObject.smallPicUrl,
    pictureObject.thumbnailUrl,
    pictureObject.url,
    asObject(pictureObject.image).picUrl,
  ];

  for (const candidate of candidates) {
    const url = normalizeJikeUrl(candidate);
    if (url) {
      return url;
    }
  }

  return '';
}

function extractPictures(pictures: unknown) {
  return asArray(pictures).map(extractPictureUrl).filter(Boolean);
}

function resolveCreatedAt(input: AnyRecord) {
  return toStringValue(input.createdAt);
}

function resolveUrlsInText(urls: unknown) {
  return asArray(urls)
    .map((url) => {
      if (typeof url === 'string') {
        return url.trim();
      }

      const urlObject = asObject(url);
      return toStringValue(urlObject.url ?? urlObject.originalUrl ?? urlObject.linkUrl).trim();
    })
    .filter(Boolean);
}

function resolveUser(input: unknown): JikeUser {
  const user = asObject(input);

  return {
    user_id: toStringValue(user.id ?? user.userId),
    username: toStringValue(user.username),
    nickname: toStringValue(user.screenName ?? user.nickname),
    avatar: normalizeJikeUrl(user.profileImageUrl ?? asObject(user.avatarImage).thumbnailUrl),
    bio: toStringValue(user.bio ?? user.briefIntro) || undefined,
    is_verified: toBooleanValue(user.isVerified),
  };
}

function resolveTopic(input: unknown): JikeTopic | undefined {
  const topic = asObject(input);
  const topicId = toStringValue(topic.id ?? topic.topicId);

  if (!topicId) {
    return undefined;
  }

  return {
    topic_id: topicId,
    content: toStringValue(topic.content),
    subscribers_count: toNumberValue(topic.subscribersCount),
    square_picture: normalizeJikeUrl(asObject(topic.squarePicture).thumbnailUrl),
  };
}

function resolveLinkInfo(input: unknown): JikeLinkInfo | undefined {
  const linkInfo = asObject(input);
  const linkUrl = normalizeJikeUrl(linkInfo.linkUrl);

  if (!linkUrl) {
    return undefined;
  }

  return {
    title: toStringValue(linkInfo.title),
    picture_url: normalizeJikeUrl(linkInfo.pictureUrl),
    link_url: linkUrl,
    source: toStringValue(linkInfo.source),
  };
}

function resolveJikePostBase(input: AnyRecord): JikePostBase {
  const createdAt = resolveCreatedAt(input);
  const readTrackInfo = asObject(input.readTrackInfo);

  return {
    type: toStringValue(input.type),
    status: toStringValue(input.status),
    user: resolveUser(input.user),
    content: toStringValue(input.content),
    urls_in_text: resolveUrlsInText(input.urlsInText),
    topic: resolveTopic(input.topic),
    like_count: toNumberValue(input.likeCount),
    comment_count: toNumberValue(input.commentCount),
    repost_count: toNumberValue(input.repostCount),
    share_count: toNumberValue(input.shareCount),
    collected: toBooleanValue(input.collected),
    pictures: extractPictures(input.pictures),
    raw_content: toStringValue(input.rawContent) || undefined,
    action_time: toStringValue(input.actionTime) || undefined,
    like_icon: toStringValue(input.likeIcon) || undefined,
    subtitle: toStringValue(input.subtitle) || undefined,
    story_status: toStringValue(readTrackInfo.storyStatus) || undefined,
    feed_type: toStringValue(readTrackInfo.feedType) || undefined,
    record_id: toStringValue(input.recordId) || undefined,
    link_info: resolveLinkInfo(input.linkInfo),
    created_at: createdAt,
    edited_at: toStringValue(input.editedAt) || undefined,
    upload_time: toNumberValue(createdAt, Date.now()),
  };
}

function resolvePostPayload(data: AnyRecord) {
  const candidates = [data, asObject(data.originalPost), asObject(data.post), asObject(data.item)];
  return candidates.find((candidate) => toStringValue(candidate.id)) ?? data;
}

function looksLikeJikePostCandidate(input: unknown) {
  const post = asObject(input);
  const postId = toStringValue(post.id ?? post.messageId);

  if (!postId) {
    return false;
  }

  if (
    toStringValue(post.targetId) ||
    toStringValue(post.threadId) ||
    toStringValue(post.targetType)
  ) {
    return false;
  }

  const user = asObject(post.user);
  const hasUser = !!toStringValue(user.id ?? user.userId);
  const hasContent = typeof post.content === 'string';
  const hasPictures = Array.isArray(post.pictures);
  const hasCounters =
    post.likeCount != null ||
    post.commentCount != null ||
    post.repostCount != null ||
    post.shareCount != null;
  const hasMetadata =
    post.createdAt != null ||
    post.status != null ||
    post.type != null ||
    post.topic != null ||
    post.urlsInText != null;

  return hasUser && (hasContent || hasPictures || hasCounters || hasMetadata);
}

function collectJikePosts(
  value: unknown,
  postMap: Map<string, JikePost>,
  seen: WeakSet<object>,
  depth = 0,
) {
  if (!value || depth > 12) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectJikePosts(item, postMap, seen, depth + 1));
    return;
  }

  if (typeof value !== 'object') {
    return;
  }

  if (seen.has(value)) {
    return;
  }

  seen.add(value);

  const objectValue = asObject(value);
  const candidate = resolvePostPayload(objectValue);

  if (looksLikeJikePostCandidate(candidate)) {
    const post = resolveJikePost(candidate);
    if (post) {
      postMap.set(post.post_id, post);
    }
  }

  Object.entries(objectValue).forEach(([key, nestedValue]) => {
    if (key === 'target' && looksLikeJikePostCandidate(candidate)) {
      return;
    }

    if (nestedValue && typeof nestedValue === 'object') {
      collectJikePosts(nestedValue, postMap, seen, depth + 1);
    }
  });
}

function resolveCommentList(data: unknown) {
  if (Array.isArray(data)) {
    return data;
  }

  const dataObject = asObject(data);
  const candidates = [
    dataObject.comments,
    dataObject.items,
    dataObject.list,
    asObject(dataObject.data).comments,
  ];

  return candidates.find(Array.isArray) ?? [];
}

function parseRequestPayload(requestBody?: string) {
  if (!requestBody) {
    return {};
  }

  try {
    return asObject(JSON.parse(requestBody));
  } catch {
    return {};
  }
}

function resolveJikeReferencedPost(input: unknown): JikeReferencedPost | null {
  const post = asObject(input);
  const postId = toStringValue(post.id ?? post.messageId);

  if (!postId) {
    return null;
  }

  return {
    post_id: postId,
    post_url: buildJikePostUrl(postId),
    ...resolveJikePostBase(post),
  };
}

function resolveJikePost(input: unknown): JikePost | null {
  const post = asObject(input);
  const basePost = resolveJikeReferencedPost(post);

  if (!basePost) {
    return null;
  }

  const targetPost = resolveJikeReferencedPost(post.target);

  return {
    ...basePost,
    target_type: toStringValue(post.targetType) || undefined,
    root_type: toStringValue(post.rootType) || undefined,
    sync_comment_id: toStringValue(post.syncCommentId) || undefined,
    target_post: targetPost && targetPost.post_id !== basePost.post_id ? targetPost : undefined,
  };
}

export function parseJikePostDetailResponse(responseText: string) {
  const json = asObject(JSON.parse(responseText));
  const data = resolvePostPayload(asObject(json.data));
  return resolveJikePost(data);
}

export function parseJikePostListResponse(responseText: string) {
  const json = asObject(JSON.parse(responseText));
  const data = json.data;
  const dataObject = asObject(data);
  const postMap = new Map<string, JikePost>();

  collectJikePosts(data, postMap, new WeakSet<object>());

  return {
    posts: [...postMap.values()],
    dataKeys: Object.keys(dataObject),
  };
}

export function parseJikeFollowingResponse(responseText: string) {
  const json = asObject(JSON.parse(responseText));
  const items = asArray(json.data);
  const typeCounts = items.reduce<Record<string, number>>((acc, item) => {
    const type = toStringValue(asObject(item).type) || 'UNKNOWN';
    acc[type] = (acc[type] ?? 0) + 1;
    return acc;
  }, {});

  const posts = items
    .map((item) => {
      const itemObject = asObject(item);
      const type = toStringValue(itemObject.type);

      if (type !== 'ORIGINAL_POST' && type !== 'REPOST') {
        return null;
      }

      return resolveJikePost(itemObject);
    })
    .filter((post): post is JikePost => !!post);

  return {
    posts,
    itemCount: items.length,
    typeCounts,
  };
}

export function parseJikeCommentsResponse(responseText: string, requestBody?: string) {
  const json = asObject(JSON.parse(responseText));
  const data = json.data;
  const dataObject = asObject(data);
  const payload = parseRequestPayload(requestBody);
  const fallbackTargetId = toStringValue(payload.targetId);
  const fallbackTargetType = toStringValue(payload.targetType);
  const comments = resolveCommentList(data);

  return {
    comments: comments
      .map((comment) => {
        const commentObject = asObject(comment);
        const commentId = toStringValue(commentObject.id);
        const targetId =
          toStringValue(commentObject.targetId ?? asObject(commentObject.target).id) ||
          fallbackTargetId;

        if (!commentId || !targetId) {
          return null;
        }

        const createdAt = toStringValue(commentObject.createdAt);

        return {
          comment_id: commentId,
          target_id: targetId,
          target_type:
            toStringValue(commentObject.targetType ?? asObject(commentObject.target).type) ||
            fallbackTargetType,
          post_url: buildJikePostUrl(targetId),
          type: toStringValue(commentObject.type),
          status: toStringValue(commentObject.status),
          thread_id: toStringValue(commentObject.threadId),
          level: toNumberValue(commentObject.level),
          user: resolveUser(commentObject.user),
          content: toStringValue(commentObject.content),
          like_count: toNumberValue(commentObject.likeCount),
          reply_count: toNumberValue(commentObject.replyCount ?? commentObject.commentCount),
          pictures: extractPictures(commentObject.pictures),
          created_at: createdAt,
          upload_time: toNumberValue(createdAt, Date.now()),
        } as JikeComment;
      })
      .filter((comment): comment is JikeComment => !!comment),
    dataKeys: Object.keys(dataObject),
    itemCount: comments.length,
  };
}
