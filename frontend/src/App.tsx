import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignIn from './_auth/SignIn';
import SignUp from './_auth/SignUp';
import Home from './_root/Home';


const App = () => {
    return (
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </Router>
    );
  };

export default App;
