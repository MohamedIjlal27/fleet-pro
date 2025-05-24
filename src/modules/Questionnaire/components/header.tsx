import SynopsLogo from "@/assets/logo.svg"; // Adjust path based on structure

const Header = () => {
  return (
    <>
      <header className="border-b border-gray-800 p-4 flex justify-center">
        <div className="text-2xl font-bold">
          <img
            src={SynopsLogo}
            alt="Synops Logo"
            className="object-contain w-24"
          />
        </div>
      </header>
      <div className="text-left mb-8 mt-16 max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-raleway font-medium mb-1 text-purple-200">
          Self-Serve Synops Registration
        </h1>
        <p className="text-sm text-purple-dim">
          Base on your choices, that what we think best fit for you business
        </p>
      </div>
    </>
  );
};

export default Header;
