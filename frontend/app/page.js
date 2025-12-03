"use client";
import Image from "next/image";
import { getPara } from "./services/api";
import { useEffect,useState } from "react";
import ThemeSelector from "./components/ThemeSelector";

export default function Home() {
  const [paragraph, setParagraph] = useState([]);
  const fetchParagraph = async () => {
    try {
      const para = await getPara();
      setParagraph(para.paragraph);
    } catch (error) {
      console.error("Failed to fetch paragraph:", error);
    }
  };
 useEffect(() => {
  fetchParagraph();
}, []);

  return (
   <main className="min-h-screen p-4" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
     <div className="absolute top-4 right-4">
       <ThemeSelector />
     </div>
     <div className="flex gap-4 flex-wrap p-1 text-2xl mt-16">
       {paragraph.map((para, index) => (
        <p key={index}>{para}</p>
       ))}
     </div>
    </main>
  );
}
