import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              FP
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-100">
              Follow<span className="text-indigo-400">Pilot</span>
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-100">Create Account</h1>
          <p className="text-sm text-slate-400">
            Start closing leads with automated sales follow-up intelligence
          </p>
        </div>

        <div className="bg-[#12151E] border border-[#1E2332] rounded-xl p-6 shadow-2xl flex justify-center">
          <SignUp
            appearance={{
              elements: {
                card: "bg-transparent shadow-none p-0 w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-[#1E2332] border-slate-700 text-slate-200 hover:bg-[#252C3D]",
                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-medium",
                footerActionLink: "text-indigo-400 hover:text-indigo-300 font-medium",
                formFieldLabel: "text-slate-300 font-medium text-xs",
                formFieldInput: "bg-[#0B0C10] border-[#2A3144] text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
                dividerLine: "bg-[#1E2332]",
                dividerText: "text-slate-500 text-xs",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
