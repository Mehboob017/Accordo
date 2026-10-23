import { addToWishlist } from '@/api/wishlist.api';
import { toggleBlogBookmark } from '@/api/blog.api';

export const POST_LOGIN_ACTION_STORAGE_KEY = 'pendingPostLoginAction';

export const POST_LOGIN_ACTIONS = {
  WISHLIST_PRODUCT: 'WISHLIST_PRODUCT',
  BLOG_BOOKMARK: 'BLOG_BOOKMARK',
};

export const storePendingPostLoginAction = (action) => {
  if (typeof window === 'undefined' || !action) {
    return;
  }

  sessionStorage.setItem(
    POST_LOGIN_ACTION_STORAGE_KEY,
    JSON.stringify(action)
  );
};

export const getPendingPostLoginAction = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawAction = sessionStorage.getItem(POST_LOGIN_ACTION_STORAGE_KEY);

  if (!rawAction) {
    return null;
  }

  try {
    return JSON.parse(rawAction);
  } catch {
    sessionStorage.removeItem(POST_LOGIN_ACTION_STORAGE_KEY);
    return null;
  }
};

export const clearPendingPostLoginAction = () => {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(POST_LOGIN_ACTION_STORAGE_KEY);
};

export const executePendingPostLoginAction = async (queryClient) => {
  const action = getPendingPostLoginAction();

  if (!action) {
    return null;
  }

  try {
    if (
      action.type === POST_LOGIN_ACTIONS.WISHLIST_PRODUCT &&
      action.productId
    ) {
      const result = await addToWishlist({
        productUid: action.productId,
        add: true,
      });

      if (queryClient) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
          queryClient.invalidateQueries({ queryKey: ['wishlistArray'] }),
        ]);
      }

      return { action, result };
    }

    if (
      action.type === POST_LOGIN_ACTIONS.BLOG_BOOKMARK &&
      action.blogId
    ) {
      const result = await toggleBlogBookmark({
        blogUid: action.blogId,
        add: typeof action.add === 'boolean' ? action.add : true,
      });

      if (queryClient) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['blogBookmarksArray'] }),
          queryClient.invalidateQueries({ queryKey: ['blogs'] }),
          queryClient.invalidateQueries({ queryKey: ['blog'] }),
        ]);
      }

      return { action, result };
    }

    return { action, result: null };
  } finally {
    clearPendingPostLoginAction();
  }
};