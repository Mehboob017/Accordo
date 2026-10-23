'use client';

import { useMemo, useState } from 'react';
import { RiBookmarkFill, RiBookmarkLine } from 'react-icons/ri';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import {
  POST_LOGIN_ACTIONS,
  storePendingPostLoginAction,
} from '@/utils/postLoginAction';
import {
  useIsBlogBookmarked,
  useToggleBlogBookmark,
} from '@/utils/hooks/useBlogBookmarks';

const toBlogUid = (blog, providedUid) => {
  if (providedUid) return String(providedUid);
  if (!blog) return null;
  return blog.uid || blog.id || null;
};

const BlogBookmarkButton = ({
  blog,
  blogUid,
  className = '',
  style,
  showLoginModal = true,
}) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [clickLocked, setClickLocked] = useState(false);
  const toggleBookmarkMutation = useToggleBlogBookmark();

  const resolvedBlogUid = useMemo(
    () => toBlogUid(blog, blogUid),
    [blog, blogUid]
  );

  const isBookmarked = useIsBlogBookmarked(resolvedBlogUid);
  const isCurrentMutationPending =
    toggleBookmarkMutation.isPending &&
    String(toggleBookmarkMutation.variables?.blogUid || '') ===
      String(resolvedBlogUid || '');
  const isInteractionDisabled =
    isCurrentMutationPending || clickLocked || !resolvedBlogUid;

  const handleBookmarkClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // console.log({
    //   isInteractionDisabled,
    //   loginModalOpen,
    // });
    
    if (isInteractionDisabled || loginModalOpen) {
      return;
    }

    setClickLocked(true);

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (!token) {
        storePendingPostLoginAction({
          type: POST_LOGIN_ACTIONS.BLOG_BOOKMARK,
          blogId: resolvedBlogUid,
          add: !isBookmarked,
        });

        if (showLoginModal) {
          setLoginModalOpen(true);
        }
        setClickLocked(false);
        return;
      }
    }

    const shouldAdd = !isBookmarked;

    toggleBookmarkMutation.mutate(
      {
        blogUid: resolvedBlogUid,
        add: shouldAdd,
      },
      {
        onSuccess: (response) => {
          ToastNotification(
            'success',
            response?.message ||
              (shouldAdd
                ? 'Blog bookmarked successfully.'
                : 'Blog bookmark removed.')
          );
        },
        onError: (error) => {
          ToastNotification(
            'error',
            error?.message || 'Failed to update blog bookmark.'
          );
        },
        onSettled: () => {
          setClickLocked(false);
        },
      }
    );
  };

  return (
    <>
      <button
        type="button"
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark blog'}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark blog'}
        aria-pressed={isBookmarked}
        className={`blog-bookmark-button ${isBookmarked ? 'active' : ''} ${isCurrentMutationPending ? 'is-loading' : ''} ${className}`.trim()}
        style={style}
        onClick={handleBookmarkClick}
        disabled={isInteractionDisabled}
      >
        {isBookmarked ? <RiBookmarkFill /> : <RiBookmarkLine />}
      </button>

      {showLoginModal && (
        <OtpLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          setOpen={setLoginModalOpen}
        />
      )}
    </>
  );
};

export default BlogBookmarkButton;
