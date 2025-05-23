import { HTMLAttributes } from "react";

export default function Button({
  children,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className="text-xl text-white font-bold hover:text-valencia hover:bg-white rounded-full px-3 py-1 transition duration-200 ease-in-out"
      {...props}
    >
      {children}
    </button>
  )
}