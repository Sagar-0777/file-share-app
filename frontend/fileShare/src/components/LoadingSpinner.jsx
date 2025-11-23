import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'spinner-sm',
        md: 'spinner-md',
        lg: 'spinner-lg',
    };

    return (
        <div className={`loading-spinner ${sizeClasses[size]}`}>
            <div className="spinner"></div>
        </div>
    );
};

export default LoadingSpinner;
