import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { FaUpload, FaFolder, FaShieldAlt, FaBolt, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const features = [
        {
            icon: FaShieldAlt,
            title: 'Secure',
            description: 'End-to-end encrypted file sharing',
        },
        {
            icon: FaBolt,
            title: 'Fast',
            description: 'Lightning-fast uploads and downloads',
        },
        {
            icon: FaGlobe,
            title: 'Accessible',
            description: 'Share with anyone, anywhere',
        },
    ];

    return (
        <div className="home-page">
            <div className="container">
                {/* Hero Section */}
                <motion.div
                    className="hero-section"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="hero-title">
                        Welcome back, <span className="gradient-text">{user?.name}</span>
                    </h1>
                    <p className="hero-subtitle">
                        Share files securely with anyone, anywhere. Fast, simple, and secure.
                    </p>

                    <div className="hero-actions">
                        <Button
                            onClick={() => navigate('/upload')}
                            variant="primary"
                            size="lg"
                            icon={FaUpload}
                        >
                            Upload File
                        </Button>
                        <Button
                            onClick={() => navigate('/my-files')}
                            variant="secondary"
                            size="lg"
                            icon={FaFolder}
                        >
                            My Files
                        </Button>
                    </div>
                </motion.div>

                {/* Features */}
                <div className="features-section">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="feature-card glass"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="feature-icon">
                                <feature.icon />
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
