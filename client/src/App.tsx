import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Room from "./pages/rooms";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:roomId" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
