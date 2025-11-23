import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaShare, FaUser, FaSignOutAlt, FaUpload, FaFolder } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar glass">
            <div className="container">
                <div className="navbar-content">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <FaShare className="logo-icon" />
                        <span className="logo-text gradient-text">FileShare</span>
                    </Link>

                    {/* Navigation Links */}
                    {isAuthenticated && (
                        <div className="navbar-links">
                            <Link to="/upload" className="nav-link">
                                <FaUpload />
                                <span>Upload</span>
                            </Link>
                            <Link to="/my-files" className="nav-link">
                                <FaFolder />
                                <span>My Files</span>
                            </Link>
                        </div>
                    )}

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <div className="navbar-user">
                            <div className="user-info">
                                <FaUser className="user-icon" />
                                <span className="user-name">{user?.name || 'User'}</span>
                            </div>
                            <button onClick={handleLogout} className="logout-btn">
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="login-btn">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
