"use client";

export default function Login() {
  return (
    <section className="min-h-screen bg-[#F8F9FC] flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-xl">

        <h1 className="text-5xl font-black text-[#0A1134] mb-3">
          Login
        </h1>

        <p className="text-gray-500 mb-8">
          Access Kebu One Management System
        </p>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email Address"
            className="w-full h-14 px-5 rounded-2xl border border-gray-200 outline-none focus:border-[#FF165E]"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full h-14 px-5 rounded-2xl border border-gray-200 outline-none focus:border-[#FF165E]"
          />

          <button
            className="
            w-full
            h-14
            rounded-2xl
            bg-[#FF165E]
            text-white
            font-bold
            hover:opacity-90
            transition
            "
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-500 cursor-pointer">
            Forgot Password?
          </p>

        </div>

      </div>

    </section>
  );
}