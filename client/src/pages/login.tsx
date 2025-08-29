import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await apiRequest("POST", "/api/register", form);
      } else {
        await apiRequest("POST", "/api/login", {
          email: form.email,
          password: form.password,
        });
      }
      navigate("/");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {isRegister ? "Registro" : "Inicio de Sesión"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <Input
                  placeholder="Nombre"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                />
                <Input
                  placeholder="Apellido"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </>
            )}
            <Input
              placeholder="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              placeholder="Contraseña"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Button type="submit" className="w-full">
              {isRegister ? "Registrarse" : "Ingresar"}
            </Button>
          </form>
          <Button
            variant="link"
            className="mt-4 w-full"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿Necesitas una cuenta? Regístrate"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
