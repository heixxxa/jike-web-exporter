import { createColumnHelper } from '@tanstack/table-core';
import { options } from '@/core/options';
import { JikePost } from '@/types/jike';
import { formatDateTime } from '@/utils/common';

const columnHelper = createColumnHelper<JikePost>();

export const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        class="checkbox checkbox-sm align-middle"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        class="checkbox checkbox-sm"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  }),
  columnHelper.display({
    id: 'index',
    header: '#',
    cell: (info) => info.row.index + 1,
  }),
  columnHelper.accessor('pictures', {
    header: 'Cover',
    cell: (info) => {
      const post = info.row.original;
      const src = info.getValue()?.[0] || post.target_post?.pictures?.[0];
      return src ? (
        <a href={src} target="_blank" rel="noopener noreferrer">
          <img src={src} class="w-16 h-16 object-cover rounded" />
        </a>
      ) : (
        <span class="text-xs opacity-50">-</span>
      );
    },
    enableSorting: false,
  }),
  columnHelper.accessor('content', {
    header: 'Content',
    cell: (info) => {
      const post = info.row.original;
      const sharedPost = post.target_post;
      const displayUrl = sharedPost?.post_url || post.post_url;
      const mainContent = info.getValue();
      const sharedContent = sharedPost?.content;
      const sharedTopic = sharedPost?.topic?.content;

      return (
        <div class="max-w-sm">
          <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="font-bold hover:underline block whitespace-pre-wrap break-words"
          >
            {mainContent || sharedContent || '(No Content)'}
          </a>
          {sharedPost ? <div class="badge badge-ghost mt-2">Shared Post</div> : null}
          {sharedPost && mainContent ? (
            <div class="mt-2 rounded border border-base-300 p-2 text-sm whitespace-pre-wrap break-words bg-base-100/60">
              <div class="font-medium">{sharedPost.user.nickname || sharedPost.user.username}</div>
              <div class="mt-1">{sharedContent || '(No Content)'}</div>
            </div>
          ) : null}
          {post.topic?.content ? (
            <div class="badge badge-outline mt-2">{post.topic.content}</div>
          ) : null}
          {!post.topic?.content && sharedTopic ? (
            <div class="badge badge-outline mt-2">{sharedTopic}</div>
          ) : null}
          <div class="text-xs opacity-50 mt-2">
            {formatDateTime(post.upload_time, options.get('dateTimeFormat'))}
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor('captured_at', {
    header: 'Captured At',
    cell: (info) => {
      const time = info.getValue();
      if (!time) return '-';
      return <div class="text-xs">{formatDateTime(time, options.get('dateTimeFormat'))}</div>;
    },
  }),
  columnHelper.accessor('user', {
    header: 'User',
    cell: (info) => {
      const user = info.getValue();
      return (
        <div class="flex items-center gap-2 max-w-48">
          {user.avatar ? <img src={user.avatar} class="w-8 h-8 rounded-full shrink-0" /> : null}
          <div class="min-w-0">
            <div class="truncate">{user.nickname}</div>
            <div class="text-xs opacity-50 truncate">{user.bio || user.username}</div>
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor('like_count', {
    header: 'Stats',
    cell: (info) => {
      const post = info.row.original;
      const statsPost = post.target_post ?? post;
      return (
        <div class="text-xs space-y-1">
          <div title="Likes">❤️ {statsPost.like_count}</div>
          <div title="Comments">💬 {statsPost.comment_count}</div>
          <div title="Reposts">🔁 {statsPost.repost_count}</div>
          <div title="Shares">📤 {statsPost.share_count}</div>
          {post.target_post ? <div class="opacity-50">from shared post</div> : null}
        </div>
      );
    },
  }),
];
