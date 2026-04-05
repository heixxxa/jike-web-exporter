import { createColumnHelper } from '@tanstack/table-core';
import { options } from '@/core/options';
import { JikeComment } from '@/types/jike';
import { formatDateTime } from '@/utils/common';

const columnHelper = createColumnHelper<JikeComment>();

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
  columnHelper.accessor('content', {
    header: 'Content',
    cell: (info) => {
      const comment = info.row.original;
      return (
        <div class="max-w-sm whitespace-pre-wrap break-words text-sm">
          {info.getValue()}
          {comment.pictures.length > 0 && (
            <div class="mt-2 flex flex-wrap gap-2">
              {comment.pictures.map((pic, idx) => (
                <a href={pic} target="_blank" rel="noopener noreferrer" key={idx}>
                  <img src={pic} class="w-16 h-16 object-cover rounded border border-base-300" />
                </a>
              ))}
            </div>
          )}
          {comment.post_url ? (
            <div class="mt-2">
              <a
                href={comment.post_url}
                target="_blank"
                rel="noopener noreferrer"
                class="link text-xs"
              >
                View Post
              </a>
            </div>
          ) : null}
        </div>
      );
    },
  }),
  columnHelper.accessor('like_count', {
    header: 'Likes',
    cell: (info) => <div class="text-center font-mono">{info.getValue()}</div>,
  }),
  columnHelper.accessor('reply_count', {
    header: 'Replies',
    cell: (info) => <div class="text-center font-mono">{info.getValue()}</div>,
  }),
  columnHelper.accessor('upload_time', {
    header: 'Date',
    cell: (info) => {
      const time = info.getValue();
      if (!time) return '-';
      return <div class="text-xs">{formatDateTime(time, options.get('dateTimeFormat'))}</div>;
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
];
