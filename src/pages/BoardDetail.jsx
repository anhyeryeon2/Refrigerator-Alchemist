import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IP_ADDRESS, useUserApi } from '../context/UserContext';
import Header from '../components/BoardDetail/Header';
import BoardDetailMain from '../components/BoardDetail/BoardDetailMain';
import Footer from '../components/UI/Footer';

const BoardDetail = () => {
  const { postId } = useParams();
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [Liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState('');
  const [likedPosts, setLikedPosts] = useState([]);
  const [nickName, setNickName] = useState('');
  const accessToken = localStorage.getItem('accessToken');
  const myEmail = localStorage.getItem('email');
  const location = useLocation();
  const { handleError } = useUserApi();

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!accessToken) {
        return; 
      }
      const URL = `${IP_ADDRESS}/board/islike?id=${myEmail}`;
      try {
        const response = await axios.get(URL, {
          headers: {
            'Authorization-Access': accessToken,
          },
        });

        if (response.data) {
          const posts = response.data.map(Number);
          setLikedPosts(posts);
          setLiked(posts.includes(Number(postId)));
        }
      } catch (error) {
        handleError(error);
      }
    };

    const fetchPostData = async (postId) => {
      try {
        const response = await axios.get(
          `${IP_ADDRESS}/board/specific?postId=${postId}`
        );

        if (response.data && Array.isArray(response.data.items)) {
          const items = response.data.items.map((item) => ({
            imageUrl: item.imageUrl,
            title: item.title,
            email: item.email,
            description: item.description,
            ingredients: item.ingredients.map((ingredient) => ingredient),
            likeCount: item.likeCount,
            nickName: item.nickName,
          }));
          setImageUrl(items[0].imageUrl);
          setTitle(items[0].title);
          setEmail(items[0].email);
          setDescription(items[0].description);
          setIngredients(items[0].ingredients);
          setLikeCount(items[0].likeCount);
          setNickName(items[0].nickName);
        } else {
          console.error('데이터 타입 오류:', response.data);
        }
      } catch (error) {
        handleError(error);
      }
    };
    fetchPostData(postId);
    fetchLikedPosts();
  }, [postId, accessToken, location, myEmail, handleError]);

  const toggleLike = async () => {
    try {
      if (Liked) {
        const response = await axios.post(
          `${IP_ADDRESS}/board/dislike`,
          {
            email: myEmail,
            postId: postId,
          },
          {
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
              Accept: 'application/json',
              'Authorization-Access': accessToken,
            },
          }
        );
        if (response.status === 200) {
          setLiked(false);
          setLikeCount((prevCount) => Number(prevCount) - 1);
          setLikedPosts((prevLikedPosts) =>
            prevLikedPosts.filter((id) => id !== postId)
          );
        }
      } else {
        const response = await axios.post(
          `${IP_ADDRESS}/board/like`,
          {
            email: myEmail,
            postId: postId,
          },
          {
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
              Accept: 'application/json',
              'Authorization-Access': accessToken,
            },
          }
        );
        if (response.status === 200) {
          setLiked(true);
          setLikeCount((prevCount) => Number(prevCount) + 1);
          setLikedPosts((prevLikedPosts) => [...prevLikedPosts, postId]);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const reportPost = async (e) => {
    e.preventDefault();
    const URL = `${IP_ADDRESS}/board/report`;

    try {
      const response = await axios.post(
        URL,
        { email: myEmail, postId: postId },
        {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            Accept: 'application/json',
            'Authorization-Access': accessToken,
          },
        }
      );

      if (response.status === 200) {
        toast.success('해당 게시물을 신고했습니다');
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <section style={{ marginBottom: '90px' }}>
      <Header reportPost={reportPost} />
      <BoardDetailMain
        imageUrl={imageUrl}
        title={title}
        description={description}
        ingredients={ingredients}
        nickName={nickName}
        likeCount={likeCount}
        Liked={Liked}
        toggleLike={toggleLike}
        accessToken={accessToken}
      />
      <Footer />
    </section>
  );
};

export default BoardDetail;
