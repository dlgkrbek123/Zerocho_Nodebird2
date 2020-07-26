import React, { useEffect } from "react";
import AppLayout from "../components/AppLayout";
import { useSelector, useDispatch } from "react-redux";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import { LOAD_POSTS_REQUEST } from "../reducers/post";

const Home = () => {
  const { me } = useSelector((state) => state.user);
  const { mainPosts, hasMorePost, loadPostsLoading } = useSelector(
    (state) => state.post
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: LOAD_POSTS_REQUEST,
    });
  }, []);

  useEffect(() => {
    function onScroll() {
      const { scrollHeight, clientHeight } = document.documentElement;

      if (scrollY + clientHeight > scrollHeight - 300) {
        if (!loadPostsLoading && hasMorePost) {
          dispatch({
            type: LOAD_POSTS_REQUEST,
          });
        }
      }
    }

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [hasMorePost, loadPostsLoading]);

  return (
    <AppLayout>
      {me && <PostForm />}
      {mainPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </AppLayout>
  );
};

export default Home;
