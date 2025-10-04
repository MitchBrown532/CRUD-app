import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Items from "./pages/Items";
import AddItem from "./pages/AddItem";

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
      <Link to="/add" style={linkStyle}>
        Add Item
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
        <Route path="/add" element={<AddItem />} />
      </Routes>
    </BrowserRouter>
  );
}
