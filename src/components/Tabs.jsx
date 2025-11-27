export default function Tabs({ activeTab, setActiveTab }) {
const tabs = [
{ id: "geral", label: "Dados Pessoais" },
{ id: "alimentacao", label: "Alimentação" },
{ id: "experiencia", label: "Experiência" },
{ id: "seguranca", label: "Segurança" },
{ id: "definicoes", label: "Definições" },
{ id: "conta", label: "Conta" },
];

return ( <div className="flex flex-wrap gap-4 mt-6 justify-start">
{tabs.map((tab) => (
<button
key={tab.id}
onClick={() => setActiveTab(tab.id)}
className={`px-4 py-2 rounded-md font-medium ${
            activeTab === tab.id  
              ? "text-orange-500 font-bold border-b-2 border-orange-500"  
              : "text-gray-600 dark:text-gray-300"  
          }`}
>
{tab.label} </button>
))} </div>
);
}
