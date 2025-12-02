import { useRef } from "react";

export default function Tabs({ activeTab, setActiveTab }) {
  const tabsRef = useRef(null);

  const tabs = [
    { id: "geral", label: "Dados Pessoais" },
    { id: "alimentacao", label: "Alimentação" },
    { id: "experiencia", label: "Experiência" },
    { id: "seguranca", label: "Segurança" },
    { id: "definicoes", label: "Definições" },
    { id: "conta", label: "Conta" },
  ];

  const scroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 150;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex items-center mt-6">
      <button
        onClick={() => scroll("left")}
        className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 md:hidden"
      >
        
      </button>

      <div
        ref={tabsRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide flex-1 px-2"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3 py-1 rounded whitespace-nowrap ${
              activeTab === tab.id
                ? "text-orange-500 font-bold border-b-2 border-orange-500"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="p-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 md:hidden"
      >
        ▶
      </button>
    </div>
  );
}
