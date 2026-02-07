import Image from "next/image";
import { CheckCircle2, GraduationCap, Users, ShieldCheck, Zap, Smartphone, FileText, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* --- HERO SECTION --- */}
      <header className="py-24 px-6 text-center max-w-5xl mx-auto space-y-8">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-3 rounded-2xl animate-bounce">
            <GraduationCap className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-950">
          A sua Escola no <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">WhatsApp.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          O EnrollMaster permite que os seus alunos se inscrevam de casa, paguem mensalidades e recebam recibos em PDF automaticamente via WhatsApp e Email.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a href="/auth/register" className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            Criar Conta Grátis
          </a>
          <a href="/auth/login" className="bg-white border border-slate-200 px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all">
            Aceder ao Painel
          </a>
        </div>
      </header>

      {/* --- VANTAGENS DO SAAS --- */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Globe className="w-8 h-8 text-blue-500" />}
            title="Inscrição Online"
            description="Alunos inscrevem-se de casa pelo navegador ou telemóvel."
          />
          <FeatureCard 
            icon={<Smartphone className="w-8 h-8 text-green-500" />}
            title="Integração WhatsApp"
            description="Notificações e recibos enviados direto para o chat do aluno."
          />
          <FeatureCard 
            icon={<FileText className="w-8 h-8 text-orange-500" />}
            title="Recibos em PDF"
            description="Geração automática de faturas e recibos profissionais."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
            title="Pagamento Seguro"
            description="Controle total de entradas via M-Pesa, E-Mola e Banco."
          />
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="precos" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">Planos para todos os tamanhos</h2>
          <p className="text-slate-500 text-lg">Escolha a autonomia que a sua instituição precisa.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Pacote Básico - Gestão Interna */}
          <PricingCard 
            title="Básico"
            price="2.000"
            description="Para gestão local da secretaria."
            features={[
              "Até 100 Alunos",
              "Gestão de Matrículas",
              "Histórico Financeiro",
              "Suporte por Ticket"
            ]}
          />
          
          {/* Pacote Profissional - Automação Média */}
          <PricingCard 
            title="Profissional"
            price="5.000"
            description="O equilíbrio perfeito para escolas em crescimento."
            highlighted={true}
            features={[
              "Até 500 Alunos",
              "Inscrições via Web/Link",
              "Recibos PDF via Email",
              "Notificações WhatsApp básicas",
              "Suporte Prioritário"
            ]}
          />

          {/* Pacote Institucional - Automação Total */}
          <PricingCard 
            title="Enterprise"
            price="10.000"
            description="Automação total e marca branca."
            features={[
              "Alunos Ilimitados",
              "Inscrições 100% via WhatsApp",
              "Recibos PDF via WhatsApp & Email",
              "API de Pagamentos Automáticos",
              "Gestor de Conta Dedicado"
            ]}
          />
        </div>
      </section>

      <footer className="py-12 border-t border-slate-200 bg-white text-center text-slate-500">
        <p className="font-bold text-slate-900 mb-2">EnrollMaster SaaS</p>
        <p className="text-sm">Modernizando a educação em Moçambique.</p>
      </footer>
    </div>
  );
}

// Componentes Auxiliares
function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="p-6 rounded-2xl hover:bg-slate-50 transition-colors space-y-3">
      <div className="mb-2">{icon}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({ title, price, description, features, highlighted = false }: any) {
  return (
    <div className={`relative p-8 rounded-3xl border transition-all duration-300 ${highlighted ? "border-primary bg-white shadow-2xl scale-105 z-10" : "border-slate-200 bg-white/60 hover:border-slate-300"}`}>
      {highlighted && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Mais Popular
        </span>
      )}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold text-slate-950">{price} MT</span>
        <span className="text-slate-500 ml-1">/mês</span>
      </div>
      <p className="text-sm text-slate-500 mb-8 min-h-[40px]">{description}</p>
      <ul className="space-y-4 mb-10">
        {features.map((f: string) => (
          <li key={f} className="flex items-start gap-3 text-sm font-medium text-slate-700">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <a 
        href="/register"
        className={`block w-full py-4 rounded-2xl text-center font-bold transition-all ${
          highlighted 
          ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-blue-200" 
          : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        Começar Agora
      </a>
    </div>
  );
}