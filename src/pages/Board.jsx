import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { IP_ADDRESS, useUserApi } from '../context/UserContext';
import RecipeCard from '../components/Board/RecipeCard';
import SearchBar from '../components/Board/SearchBar';
import WriteButton from '../components/Board/WriteButton';
import RankingBoard from '../components/Board/RankingBoard';
import Navigation from '../components/ui/Navigation';
import ScrollToTopButton from '../components/ui/ScrollToTopButton';
import useScrollToTop from '../components/ui/useScrollToTop';
const accessToken = localStorage.getItem('accessToken');
const email = localStorage.getItem('email');

const Board = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [likedPosts, setLikedPosts] = useState([]);
  const [searchResultCount, setSearchResultCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const recipesPerPage = 6;
  const { handleError } = useUserApi();
  const observer = useRef();

  const { showScrollToTop, scrollToTop } = useScrollToTop();

  useEffect(() => {
    fetchLikedPosts();
    fetchTotalRecipes();
    if (!window.location.hash) {
      window.location = window.location + '#loaded';
      window.location.reload();
    }
  }, [location.pathname, accessToken]);

  useEffect(() => {
    fetchRecipesByPage(currentPage);
  }, [currentPage]);

  const fetchLikedPosts = async () => {
    if (!accessToken) {
      return;
    }
    const URL = `${IP_ADDRESS}/board/islike?id=${email}`;
    try {
      const response = await axios.get(URL, {
        headers: {
          'Authorization-Access': accessToken,
        },
      });
      if (response.data) {
        const posts = response.data.map(Number);
        setLikedPosts(posts);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const fetchTotalRecipes = async () => {
    try {
      const response = await axios.get(`${IP_ADDRESS}/board/total`);
      const totalRecipes = response.data;
      const totalPages = Math.ceil(totalRecipes / recipesPerPage);
      setTotalPages(totalPages);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchRecipesByPage = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await axios.get(`${IP_ADDRESS}/board/page`, {
        params: { data: pageNumber.toString() },
      });
      if (response.data && Array.isArray(response.data.items)) {
        const formattedData = response.data.items.map((item) => ({
          id: item.ID,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          likeCount: item.likeCount,
        }));
        setRecipes((prevRecipes) => [...prevRecipes, ...formattedData]);
      } else {
        console.error(' error:', response.data);
      }
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isSearching) {
      setTotalPages(Math.ceil(searchResultCount / recipesPerPage));
    } else {
      fetchTotalRecipes();
    }
  }, [searchResultCount, isSearching, recipesPerPage]);

  const handleSearch = (results) => {
    setSearchResults(results);
    setIsSearching(true);
    setSearchResultCount(results.length);
    setCurrentPage(1);
    if (results.length <= recipesPerPage) {
      setTotalPages(1);
    }
  };

  const lastRecipeElementRef = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && currentPage < totalPages) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  };

  return (
    <main className="Board pb-24">
      <header className="bg-white px-6 py-7">
        <h1 className="font-scoreExtrabold font-extrabold text-3xl">
          레시피 게시판
        </h1>
      </header>
      <section className="flex items-center mx-6">
        <SearchBar onSearch={handleSearch} />
        <WriteButton />
      </section>
      <section>
        {isSearching ? (
          <div className="my-2 mt-4">
            <h2 className="font-scoreExtrabold font-extrabold ml-6 text-2xl">
              검색 결과
            </h2>
            {searchResults.map((recipe, index) => (
              <RecipeCard
                ref={
                  searchResults.length === index + 1
                    ? lastRecipeElementRef
                    : null
                }
                key={recipe.id}
                postId={recipe.id}
                title={recipe.title}
                description={recipe.description}
                img={recipe.imageUrl}
                initialLikeCount={recipe.likeCount}
                isLiked={likedPosts.includes(Number(recipe.id))}
              />
            ))}
          </div>
        ) : (
          <>
            <RankingBoard />
            <div className="my-2">
              <h2 className="font-scoreExtrabold font-extrabold ml-6 text-2xl">
                레시피
              </h2>
              {recipes.map((recipe, index) => (
                <RecipeCard
                  ref={
                    recipes.length === index + 1 ? lastRecipeElementRef : null
                  }
                  key={recipe.id}
                  postId={recipe.id}
                  title={recipe.title}
                  description={recipe.description}
                  img={recipe.imageUrl}
                  initialLikeCount={recipe.likeCount}
                  isLiked={likedPosts.includes(Number(recipe.id))}
                />
              ))}
            </div>
          </>
        )}
      </section>
      <ScrollToTopButton
        showScrollToTop={showScrollToTop}
        scrollToTop={scrollToTop}
      />
      <footer
        style={{
          position: 'fixed',
          bottom: '0',
          width: '100%',
          maxWidth: '31rem',
        }}
      >
        <Navigation />
      </footer>
    </main>
  );
};

export default Board;
