import './Button.css';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    fullWidth = false,
    ...props
}) => {
    const sizeClasses = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg',
    };

    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger',
        ghost: 'btn-ghost',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'btn-full' : ''
                }`}
            {...props}
        >
            {loading ? (
                <>
                    <span className="btn-spinner"></span>
                    Loading...
                </>
            ) : (
                <>
                    {Icon && <Icon className="btn-icon" />}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
