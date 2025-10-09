import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Items from "./pages/Items";

function Navbar() {
  const linkStyle = { marginRight: 12 };
  return (
    <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
      <Link to="/" style={linkStyle}>
        Home
      </Link>
      <Link to="/items" style={linkStyle}>
        Items
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<Items />} />
      </Routes>
    </BrowserRouter>
  );
}
