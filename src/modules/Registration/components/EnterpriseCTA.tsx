import { Button } from "@/components/ui/button";

const EnterpriseCTA = () => {
  return (
    <div className="bg-[#010738] rounded-lg p-6 mb-8 dark:border-neutral-800">
      <h3 className="text-lg font-semibold mb-2 text-[#D9DBE9]">
        Enterprise & Government Solutions
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Need a custom solution? Our enterprise and government packages offer
        tailored features to meet your specific requirements.
      </p>
      <Button
        className="w-64 py-6 px-9 font-raleway font-extralight text-white rounded-[50px] bg-gradient-to-l from-[#2510CC] to-[#010111] border-t border-l border-b-0 border-r-0 border-solid border-[rgba(255,255,255,0.4)] hover:scale-105 transition-transform duration-200"
        onClick={() => window.open("https://www.Synopsfleet.ai/contact/", "_blank")}
      >
        Contact Sales
      </Button>
    </div>
  );
};

export default EnterpriseCTA;