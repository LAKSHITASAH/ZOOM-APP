import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Prejoin from "./pages/Prejoin";
import Room from "./pages/Room";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/app" element={<Home />} />

      {/* ✅ must exist */}
      <Route path="/prejoin/:code" element={<Prejoin />} />
      <Route path="/room/:code" element={<Room />} />
    </Routes>
  );
}
