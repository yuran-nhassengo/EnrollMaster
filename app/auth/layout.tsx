import { GraduationCap, CheckCircle2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* LADO ESQUERDO: Formulários */}
      <div className="flex w-full flex-col justify-center px-8 md:w-[450px] lg:w-[550px] xl:w-[650px] border-r border-slate-100">
        <div className="mx-auto w-full max-w-[380px] space-y-8">
          <div className="flex items-center gap-2 font-bold text-blue-600 mb-4">
            <GraduationCap className="h-10 w-10" />
            <span className="text-2xl tracking-tighter">EnrollMaster</span>
          </div>
          {children}
        </div>
      </div>

      {/* LADO DIREITO: Painel Informativo (O Slide) */}
      <div className="hidden flex-1 bg-slate-950 lg:block relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070')] bg-cover bg-center opacity-10" />
        
        <div className="relative h-full flex flex-col justify-between p-16 text-white">
          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight">
              Inscrições <span className="text-blue-500">24/7</span>,<br /> de qualquer lugar.
            </h2>
            <p className="text-xl text-slate-400 max-w-lg">
              Reduza filas na secretaria. Permita que seus alunos façam tudo pelo smartphone e recebam o recibo via WhatsApp.
            </p>
            
            <div className="space-y-4 pt-6">
              {[
                "Recibos PDF Automáticos",
                "Pagamento via M-Pesa Integrado",
                "Gestão de Propinas e Multas",
                "Portal do Aluno Responsivo"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  <span className="text-lg font-medium text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm border border-white/10">
            <p className="text-lg italic text-slate-300">
              "O EnrollMaster mudou a forma como interagimos com os encarregados. Tudo ficou mais transparente e rápido."
            </p>
            <p className="mt-4 font-bold">— Escola Internacional de Maputo</p>
          </div>
        </div>
      </div>
    </div>
  );
}