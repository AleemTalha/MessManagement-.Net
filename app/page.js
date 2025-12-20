export const metadata = {
  title: "Home",
  description: "Welcome to the Mess Management System",
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-4">
          Mess Management System
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          A centralized platform to manage mess operations, users, meals, and
          administrative workflows efficiently and securely.
        </p>
      </div>
    </main>
  );
}
