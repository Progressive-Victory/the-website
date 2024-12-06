const CTA = ({
  askText,
  buttonText,
}: {
  askText: string;
  buttonText: string;
}) => {
  return (
    <div className={`relative bg-prussian shadow-2xl w-full`}>
      <div className="-translate-y-[5px] -translate-x-1 bg-jasper p-4">
        <div className="flex flex-col items-center justify-center w-full gap-y-4">
          <h1 className="text-4xl font-bold text-white text-center">
            {askText}
          </h1>
          <button className="py-2 px-4 text-white bg-black hover:bg-white hover:text-black font-bold">
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CTA;
