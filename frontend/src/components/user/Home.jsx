import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Carousel from "./Carousel";
import Footer from "./Footer";
import policyPdf from '../../assets/Return and Refund Policy.pdf';

const Home = () => {
  
  const BitcoinCoin = ({ size = 64 }) => (
    <svg width={size * 1.5} height={size * 1.5} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#F7931A" />
      <text
        x="32"
        y="45"
        fontSize="42"
        fill="white"
        textAnchor="middle"
        fontWeight="bold"
      >
        ₿
      </text>
    </svg>
  );

  const DollarBill = ({ size = 50 }) => (
    <svg width={size * 2} height={size * 1.25} viewBox="0 0 80 50">
      <rect x="2" y="2" width="76" height="46" rx="6" fill="#116B32" />
      <rect x="6" y="6" width="68" height="38" rx="4" fill="#157A3B" />
      <text
        x="40"
        y="35"
        fontSize="30"
        fill="#FFF"
        textAnchor="middle"
        fontWeight="bold"
      >
        $
      </text>
    </svg>
  );

  const AnimatedBackground = () => {
    const [items, setItems] = useState([]);
    useEffect(() => {
      if (localStorage.getItem("accepted")) {
      window.location.href = "/member-registration";
      }
    }, []);
    useEffect(() => {
      // Create more items for a denser effect
      const createItem = () => ({
        id: `item-${Date.now()}-${Math.random()}`,
        x: Math.random() * 100,
        isCoin: Math.random() > 0.5,
        size: 24 + Math.random() * 20,
        duration: 6 + Math.random() * 2, // Faster fall duration
        delay: Math.random() * 4, // Staggered starts
      });

      // Initial items - create more for denser effect
      const initialItems = Array.from({ length: 40 }, createItem);
      setItems(initialItems);

      // Add new items more frequently
      const interval = setInterval(() => {
        const newItem = createItem();
        setItems((prev) => [...prev.slice(-39), newItem]); // Keep last 39 items + new one
      }, 150); // Add items more frequently

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="fixed inset-0 w-full h-full bg-green-100/75 overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute"
            style={{
              left: `${item.x}%`,
              animation: `continuousFall ${item.duration}s linear infinite`,
              animationDelay: `-${item.delay}s`,
            }}
          >
            <div
              style={{
                animation: "gentleRotate 3s linear infinite",
              }}
            >
              {item.isCoin ? (
                <BitcoinCoin size={item.size} />
              ) : (
                <DollarBill size={item.size} />
              )}
            </div>
          </div>
        ))}
        <style>
          {`
          @keyframes continuousFall {
            from {
              transform: translateY(-10vh);
            }
            to {
              transform: translateY(110vh);
            }
          }
          @keyframes gentleRotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
        </style>
      </div>
    );
  };
  return (
    <>
      <div className="overflow-hidden ">
        <Navbar />
        <div className="relative md-min-h-screen">
          <AnimatedBackground />
          <div className="relative z-10 ">
            <Hero />
  <footer className="bg-green-800 text-white py-12">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
      </div>
      
      <div className="grid md:grid-cols-4 gap-8 text-center">
        <div>
          <h3 className="text-xl font-semibold mb-2">Email</h3>
          <p className="text-yellow-300">wemultiply27@gmail.com</p>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Contact Number</h3>
          <p className="text-yellow-300">0968 888 1188</p>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
          <p className="text-yellow-300">
            A&C Bldg Gil Carlos Street<br />
            Poblacion Baliwag, Bulacan
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Return and Refunds Policy</h3>
                     <button
                       type="button"
                       className="text-yellow-300 underline"
                       onClick={() => window.open(policyPdf)}
                     >
                       Return and Refund Policy
                     </button>
        </div>
      </div>
    </div>
  </footer>
          </div>
        </div>
      </div>


    </>
  );
};

export default Home;
