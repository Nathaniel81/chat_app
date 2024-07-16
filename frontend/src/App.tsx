import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import MainApp from './_root/MainApp';
// import SignIn from './_root/Signin';
import Auth from './_auth/Auth';
import Home from './_root/Home';


const App = () => {
    return (
        <Router>
          <Routes>
            {/* <Route path="/" element={<MainApp />} /> */}
            <Route path="/" element={<Home />} />
            {/* <Route path="/signin" element={<SignIn />} /> */}
            <Route path="/signin" element={<Auth />} />
          </Routes>
        </Router>
    );
  };

export default App;
