interface InputProps {
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
    isTextArea?: boolean;
}
const Input = ({ placeholder, value, onChange, isTextArea }: InputProps) => {
  return (
    isTextArea ? (
      <textarea 
        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
      />
    ) : (
      <input 
        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
      />
    )
  );
};

export default Input;