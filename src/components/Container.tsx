const Container = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`relative bg-prussian shadow-2xl ${className}`}>
      <div className="-translate-y-[5px] -translate-x-1 bg-steel-blue">
        {children}
      </div>
    </div>
  );
};

export default Container;
