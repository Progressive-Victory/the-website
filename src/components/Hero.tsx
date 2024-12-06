import Image from "next/image";
import Container from "./Container";
const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full z-1">
      <Container className="w-full">
        <div className="relative w-full h-[150px] sm:h-[400px] md:h-[500px] overflow-hidden">
          <Image
            src="/images/pv-landing.jpg"
            alt="Hero Image"
            fill
            className="object-cover"
          />
        </div>
      </Container>
      <div className="flex flex-col md:flex-row items-center justify-center w-full gap-x-4 gap-y-8 md:gap-y-0 mt-8">
        <Container className="w-full">
          <div className="p-4 sm:h-[300px] flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-white px-4 sm:whitespace-nowrap">
              By the <span className="italic">Internet</span>. For{" "}
              <span className="italic">America</span>.
            </h1>
            <p className="text-white px-4 py-2 md:text-center">
              Progressive Victory is an online community of volunteers,
              activists, and organizers. Using the power of the internet, we
              {"'"}re winning elections, protecting democracy, and building the
              next generation of organizers. Join us in our mission today!
            </p>
          </div>
        </Container>
        <Container className="w-full order-first md:order-last">
          <div className="relative w-full h-[200px] sm:h-[300px] overflow-hidden">
            <Image
              src="/images/protestors-ukraine.jpg"
              alt="Hero Image"
              fill
              className="object-cover"
            />
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Hero;
