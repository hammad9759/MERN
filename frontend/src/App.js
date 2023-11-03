import Navbar from './components/navbar/navbar';
import Footer from './components/footer/footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Protected from "./components/protected/protected";

import Home from './pages/Home/home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Error from './pages/Error/error';

import { useSelector } from "react-redux";

function App() {
  const isAuth = useSelector((state) => state.user.auth);
  return (
    <div className='container-fluid'>
      <BrowserRouter>
        <div className='layout'>
          {/* header */}
          <Navbar />

          {/* main pages  */}
          <Routes>

            <Route path="/" exact element={<div className="container main"> <Home /> </div>} />

            <Route path="/home" exact element={<div className="container main"> <Home /> </div>} />

            <Route path="/crypto" exact element={ <div className="container main"> Crypto page </div> } />

            <Route path="/blogs" exact element={ <Protected isAuth={isAuth}> <div className="container main"> Blog page </div> </Protected> } />

            <Route path="/submit" exact element={ <Protected isAuth={isAuth}> <div className="container main"> Submit a Blog page </div> </Protected> } />

            <Route path="/login" exact element={ <div className="container main"> <Login /> </div> } />

            <Route path="/signup" exact element={ <div className="container main">  <Signup /> </div> } />

            <Route path="*" element={ <div className="container main"> <Error /> </div> } />
          </Routes>

          {/* Footer */}
          <div className='container'>
            <Footer />
          </div>

        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;


// 7:06