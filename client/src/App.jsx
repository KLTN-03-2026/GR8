import { BrowserRouter, Routes, Route } from "react-router-dom";
import ApartmentList from "./pages/ApartmentList.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/apartments" element={<ApartmentList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;