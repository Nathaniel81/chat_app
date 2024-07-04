import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import SignIn from './pages/Signin';

const style = {
  appContainer: `max-w-[728px] mx-auto text-center`,
  sectionContainer: `flex flex-col h-[90vh] bg-gray-100 mt-10 shadow-xl border relative`,
};

function App() {
  return (
    <Router>
        <div className={style.appContainer}>
          <section className={style.sectionContainer}>
            <Routes>
              <Route index element={<Chat />} />
              <Route path="/signin" element={<SignIn />} />
            </Routes>
          </section>
        </div>
    </Router>
  );
}

export default App;
