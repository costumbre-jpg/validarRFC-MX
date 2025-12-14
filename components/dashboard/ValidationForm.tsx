"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { formatRFC, isValidRFCFormat } from "@/lib/utils";

interface ValidationFormProps {
  onSubmit: (rfc: string) => Promise<void>;
  isLoading?: boolean;
  remainingQueries?: number;
  planLimit?: number;
}

export default function ValidationForm({
  onSubmit,
  isLoading = false,
  remainingQueries = 0,
  planLimit = 5,
}: ValidationFormProps) {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const urlSuffix = planParam && ["pro", "business"].includes(planParam) ? `?plan=${planParam}` : "";
  
  const [rfc, setRfc] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formattedRFC = formatRFC(rfc);

    if (!formattedRFC) {
      setError("Por favor ingresa un RFC");
      return;
    }

    if (!isValidRFCFormat(formattedRFC)) {
      setError("El formato del RFC no es válido");
      return;
    }

    if (remainingQueries <= 0) {
      setError(
        `Has alcanzado el límite de ${planLimit} validaciones este mes. Mejora tu plan para obtener más.`
      );
      return;
    }

    try {
      await onSubmit(formattedRFC);
      setRfc("");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al validar el RFC");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="RFC a validar"
        placeholder="Ej: ABC123456XYZ"
        value={rfc}
        onChange={(e) => {
          setRfc(e.target.value);
          setError(null);
        }}
        error={error || undefined}
        helperText="Ingresa el RFC que deseas validar contra el SAT"
        disabled={isLoading || remainingQueries <= 0}
      />

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!rfc.trim() || remainingQueries <= 0}
          className="flex-1"
        >
          {isLoading ? "Validando..." : "Validar RFC"}
        </Button>
      </div>

      {remainingQueries > 0 && (
        <p className="text-sm text-gray-500 text-center">
          Validaciones restantes este mes:{" "}
          <span className="font-semibold text-gray-700">
            {remainingQueries}
          </span>
        </p>
      )}

      {remainingQueries <= 0 && (
        <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            Has alcanzado el límite de validaciones.{" "}
            <a
              href={`/dashboard/billing${urlSuffix}`}
              className="font-medium text-yellow-900 underline hover:text-yellow-700"
            >
              Mejora tu plan
            </a>{" "}
            para obtener más.
          </p>
        </div>
      )}
    </form>
  );
}

