interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}
const Button = ({ children, onClick, variant = 'primary' }: ButtonProps) => {
  const baseClasses = "px-4 py-2 rounded-md";
  
  const variantClasses = variant === 'primary'
    ? "bg-blue-500 text-white"
    : variant === 'secondary'
    ? "bg-gray-300 text-gray-700"
    : "bg-red-500 text-white";

  return (
    <button className={`${baseClasses} ${variantClasses}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;