"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("Login realizado com sucesso!");
      router.push("/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-background p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md"
            disabled={isLoading}
          >
            Entrar
          </button>
        </form>

        {message && <p className="mt-4 text-center text-red-500">{message}</p>}

        {/* Link para a página de cadastro */}
        <p className="mt-4 text-center text-gray-600">
          Ainda não tem conta?????{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Crie aqui!!!!
          </Link>
        </p>
      </div>
    </div>
  );
}
