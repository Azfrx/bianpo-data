import { Link } from "react-router-dom";
import './index.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">MySite</h2>
      <div className="links">
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </div>
    </nav>
  );
}
