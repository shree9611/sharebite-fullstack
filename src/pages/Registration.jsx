import { useState } from "react";

export default function Registration() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-background-light">
      {/* NAVBAR (same for both steps) */}
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-5 bg-white border-b">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-green-500 text-3xl">
            volunteer_activism
          </span>
          <h1 className="text-xl font-bold">ShareBite</h1>
        </div>

        <span className="px-3 sm:px-4 py-2 rounded-full bg-accent-orange text-white text-xs sm:text-sm font-semibold">
          Step {step} of 2
        </span>
      </header>

      {/* STEP CONTENT */}
      {step === 1 && <AccountDetails onContinue={() => setStep(2)} />}
      {step === 2 && <StepTwoForm onBack={() => setStep(1)} />}
    </div>
  );
}



