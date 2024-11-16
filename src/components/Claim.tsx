export default function Claim() {
  return (
    <div className="text-center space-y-4 md:space-y-8">
      <h2 className="text-2xl md:text-4xl font-mondwest">
        <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
          Coming Soon!
        </span>
      </h2>
      <div className="p-[2px] rounded-lg bg-gradient-to-r from-[#9945FF] to-[#14F195] w-full max-w-[30rem] mx-auto">
        <div className="w-full h-40 md:h-60 rounded-lg overflow-hidden">
          <img
            src="/assets/web assets video/retardio.gif"
            alt="Retardio"
            className="w-full h-full object-fill"
          />
        </div>
      </div>
      <div className="p-[1px] rounded-md bg-gradient-to-r from-[#9945FF] to-[#14F195] w-full max-w-xs mx-auto">
        <button 
          disabled
          className="w-full py-2 rounded-md font-mondwest text-lg md:text-xl bg-black text-white opacity-50 cursor-not-allowed"
        >
          Coming Soon!
        </button>
      </div>
    </div>
  );
} 