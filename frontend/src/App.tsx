import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainApp from './_root/MainApp';
import SignIn from './_root/Signin';


const App = () => {
    return (
        <Router>
          <Routes>
            <Route path="/" element={<MainApp />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </Router>
    );
  };

export default App;
