import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* LEWA KOLUMNA: Formularz */}
      <div className="flex w-full flex-col justify-center px-4 md:w-1/2 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {children}
        </div>
      </div>

      {/* PRAWA KOLUMNA: Zdjęcie/Grafika (Ukryta na mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden bg-content1 md:block">
        {/* Nałożenie gradientu, żeby nadać "neuro" klimat */}
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-primary/20 to-secondary/10" />
        
        {/* Tutaj możesz wstawić <Image /> z Next.js lub zwykły <img> */}
        <img
          src="https://images.unsplash.com/photo-1620712943543-bcc4628c9759?q=80&w=1965&auto=format&fit=crop"
          alt="Neural Interface Concept"
          className="h-full w-full object-cover grayscale opacity-80 transition-transform duration-700 hover:scale-105"
        />

        {/* Opcjonalny napis na zdjęciu */}
        <div className="absolute bottom-12 left-12 z-20 max-w-md">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium text-white/90 italic">
              "Przyszłość analityki neuronowej zaczyna się od jednego połączenia."
            </p>
            <footer className="text-sm text-white/50">Neuro Chord AI System v1.0</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}