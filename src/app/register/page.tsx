"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("Cadastro realizado com sucesso!");
      setTimeout(() => router.push("/"), 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Cadastro</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nome"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

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

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md">
            Cadastrar
          </button>
        </form>

        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
}
