import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "react-hot-toast"
import { AuthContext } from "../context/AuthContext";
import GroupPage from "./pages/GroupPage";

const App = () => {
  const { authUser } = useContext(AuthContext)
  return (
    <div className="bg-[url('/bgImage.svg')] bg-cover bg-center overflow-hidden">
      <Toaster/>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
        <Route path="/login" element={!authUser ? <LoginPage /> :<Navigate to="/" />} />
        <Route path="/profile" element={authUser ?<ProfilePage /> :<Navigate to="/login" /> } />
      <Route path="/groups" element={<GroupPage />} />
      </Routes>
    </div>
  );
};

export default App;
