import { useState } from 'react';
 
interface DropdownProps {
  onSelect: (option: string) => void;
}
 
const Dropdown = ({ onSelect }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'];
 
  return (
    <div className="relative flex justify-center items-center h-screen">
      <div className="flex flex-col items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Open Dropdown
        </button>
 
        {isOpen && (
          <div className="mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 text-left"
                  role="menuitem"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default Dropdown;