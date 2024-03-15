import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Navigation from '../components/Navigation';
import axios from 'axios';

const GptSavedDetail = () => {
  const [recipeData, setRecipeData] = useState({});
  const { recipeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        const response = await axios.get(`http://192.168.0.35:8080/recipe/myRecipe/${recipeId}`);
        setRecipeData(response.data);
      } catch (error) {
        console.error('에러내용:', error);
      }
    };

    fetchRecipeData();
}, [recipeId]);
  

  // 임시 데이터
  // const tempData = {
  //   foodName: "Temp Recipe",
  //   // imgUrl: "https://via.placeholder.com/150",
  //   ingredients: ["딸기", "식빵", "오이", "양파", "양배추"],
  //   recipe: [
  //     "1. ~~~~",
  //     "2. ~~~~",
  //     "3. ~~~~"
  //   ]
  // };

  // useEffect(() => {
  //   if (!Object.keys(recipeData).length) {
  //     setRecipeData(tempData);
  //   }
  // }, [recipeData, tempData]);

  return (
    <>
      <div className="pt-16">
        <div
          className="absolute top-5 left-42 ml-4 border-2 w-10 h-10 transition ease-in-out delay-150 bg-main hover:bg-indigo-500 hover:scale-125 hover:cursor-pointer hover:text-white rounded-full flex items-center justify-center"
          onClick={() => navigate('/recipe/myRecipe')}
        >
          <FaArrowLeft />
        </div>
        {/* <img
          src={recipeData.imgUrl}
          alt={recipeData.foodName}
          className="mt-10 mb-4 w-80 h-60 object-cover rounded-lg mx-auto"
        /> */}

        <div className="flex flex-col items-center mt-10">
          <div className="flex items-center gap-4">
            <h2 className="font-score text-3xl font-bold">{recipeData.foodName}</h2>
          </div>
          <div className="font-score text-lg text-gray-500 my-8">
            {recipeData.ingredients ? recipeData.ingredients.join(' · ') : ''}
          </div>
          <div className="text-gray-700 font-score mt-6 m-6">
            {recipeData.recipe && recipeData.recipe.map((step, index) => (
              <p key={index}>{step}</p>
            ))}
          </div>
        </div>
      </div>
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
    </>
  );
};

export default GptSavedDetail;
