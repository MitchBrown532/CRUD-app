import { Link } from "react-router-dom";

export default function Navbar() {
  const linkStyle = { marginRight: 12, textDecoration: "none", color: "blue" };
  const navStyle = { padding: 12, borderBottom: "1px solid #eee" };
  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle}>
        Home
      </Link>
      <Link to="/items" style={linkStyle}>
        Items
      </Link>
    </nav>
  );
}