"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import { getPlan } from "@/lib/plans";

function DevelopersPageContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const fromParam = searchParams.get("from");
  const isFromLanding = fromParam === "landing";

  // Plan que usaremos para construir los links (preserva business si viene de la URL o de localStorage)
  const [designPlan, setDesignPlan] = useState<"pro" | "business">("pro");

  useEffect(() => {
    const fromUrl =
      planParam && ["pro", "business"].includes(planParam) ? (planParam as "pro" | "business") : null;
    if (fromUrl) {
      setDesignPlan(fromUrl);
      return;
    }
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("maflipp_plan");
      if (stored && ["pro", "business"].includes(stored)) {
        setDesignPlan(stored as "pro" | "business");
        return;
      }
    }
    setDesignPlan("pro");
  }, [planParam]);

  const urlSuffix = `?plan=${designPlan}`;
  const proPlan = getPlan("pro");
  const businessPlan = getPlan("business");
  
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Usar URL relativa para evitar errores de hidratación
  // Esto funciona tanto en desarrollo como en producción
  const apiEndpoint = "/api/public/validate";
  const baseUrlForExamples = mounted && typeof window !== "undefined" 
    ? window.location.origin 
    : "https://maflipp.com";
  const apiUrlForExamples = `${baseUrlForExamples}${apiEndpoint}`;
  const exampleRfc = "XAXX010101000";
  const exampleApiKey = "sk_live_tu_api_key_aqui";

  // Usar useMemo para recalcular ejemplos después del mount
  const codeExamples = useMemo(() => ({
    javascript: `// Validar RFC con JavaScript (Fetch API)
async function validateRFC(rfc, apiKey) {
  try {
    const response = await fetch('${apiUrlForExamples}', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rfc: rfc }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('RFC válido:', data.valid);
      console.log('Mensaje:', data.message);
      console.log('Consultas restantes:', data.remaining);
      return data;
    } else {
      console.error('Error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error de red:', error);
    return null;
  }
}

// Uso
validateRFC('${exampleRfc}', '${exampleApiKey}');`,

    nodejs: `// Validar RFC con Node.js (Node 18+ con fetch)
async function validateRFC(rfc, apiKey) {
  const response = await fetch('${apiUrlForExamples}', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rfc }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Error HTTP ' + response.status);
  }

  return data;
}

// Uso
validateRFC('${exampleRfc}', '${exampleApiKey}')
  .then(console.log)
  .catch(console.error);`,

    python: `# Validar RFC con Python
import requests
import json

def validate_rfc(rfc, api_key):
    url = '${apiUrlForExamples}'
    headers = {
        'X-API-Key': api_key,
        'Content-Type': 'application/json',
    }
    data = {'rfc': rfc}
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        
        if result.get('success'):
            print(f"RFC válido: {result['valid']}")
            print(f"Mensaje: {result['message']}")
            print(f"Consultas restantes: {result['remaining']}")
            return result
        else:
            print(f"Error: {result['message']}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Error de red: {e}")
        return None

# Uso
result = validate_rfc('${exampleRfc}', '${exampleApiKey}')`,

    php: `<?php
// Validar RFC con PHP
function validateRFC($rfc, $apiKey) {
    $url = '${apiUrlForExamples}';
    
    $data = json_encode(['rfc' => $rfc]);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: ' . $apiKey,
        'Content-Type: application/json',
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $result = json_decode($response, true);
        
        if ($result['success']) {
            echo "RFC válido: " . ($result['valid'] ? 'Sí' : 'No') . "\\n";
            echo "Mensaje: " . $result['message'] . "\\n";
            echo "Consultas restantes: " . $result['remaining'] . "\\n";
            return $result;
        } else {
            echo "Error: " . $result['message'] . "\\n";
            return null;
        }
    } else {
        echo "Error HTTP: " . $httpCode . "\\n";
        return null;
    }
}

// Uso
validateRFC('${exampleRfc}', '${exampleApiKey}');
?>`,

    curl: `# Validar RFC con cURL
curl -X POST '${apiUrlForExamples}' \\
  -H 'X-API-Key: ${exampleApiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "rfc": "${exampleRfc}"
  }'`,

    java: `// Validar RFC con Java
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.*;

public class MaflippAPI {
    public static String validateRFC(String rfc, String apiKey) throws IOException {
        URL url = new URL("${apiUrlForExamples}");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        
        conn.setRequestMethod("POST");
        conn.setRequestProperty("X-API-Key", apiKey);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        
        String jsonInputString = "{\"rfc\":\"" + rfc + "\"}";
        
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonInputString.getBytes("utf-8");
            os.write(input, 0, input.length);
        }
        
        int responseCode = conn.getResponseCode();
        
        if (responseCode == HttpURLConnection.HTTP_OK) {
            BufferedReader in = new BufferedReader(
                new InputStreamReader(conn.getInputStream())
            );
            String inputLine;
            StringBuilder response = new StringBuilder();
            
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();
            
            return response.toString();
        } else {
            return "Error: " + responseCode;
        }
    }
    
    public static void main(String[] args) {
        try {
            String result = validateRFC("${exampleRfc}", "${exampleApiKey}");
            System.out.println(result);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}`,
  }), [apiUrlForExamples, exampleApiKey, exampleRfc]);

  const copyToClipboard = (code: string, lang: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(lang);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Función simplificada para aplicar syntax highlighting
  const highlightCode = (code: string, language: string) => {
    if (!code) return code;

    // Colores del tema One Dark Pro
    const colors = {
      keyword: '#C678DD',
      function: '#61AFEF',
      string: '#98C379',
      comment: '#5C6370',
      number: '#D19A66',
      operator: '#56B6C2',
      property: '#E5C07B',
      boolean: '#56B6C2',
      default: '#ABB2BF',
    };

    // Escapar HTML
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // JSON highlighting
    if (language === 'json' || (code.trim().startsWith('{') && code.includes('"success"'))) {
      highlighted = highlighted.replace(/&quot;([^&]+)&quot;:/g, `<span style="color:${colors.property}">&quot;$1&quot;</span><span style="color:${colors.default}">:</span>`);
      highlighted = highlighted.replace(/:\s*&quot;([^&]*)&quot;/g, `<span style="color:${colors.default}">: </span><span style="color:${colors.string}">&quot;$1&quot;</span>`);
      highlighted = highlighted.replace(/:\s*(\d+)/g, `<span style="color:${colors.default}">: </span><span style="color:${colors.number}">$1</span>`);
      highlighted = highlighted.replace(/:\s*(true|false)/g, `<span style="color:${colors.default}">: </span><span style="color:${colors.boolean}">$1</span>`);
      return highlighted;
    }

    // Comentarios
    if (language === 'javascript' || language === 'nodejs' || language === 'java') {
      highlighted = highlighted.replace(/\/\/.*$/gm, `<span style="color:${colors.comment}">$&</span>`);
    } else if (language === 'python' || language === 'curl') {
      highlighted = highlighted.replace(/#.*$/gm, `<span style="color:${colors.comment}">$&</span>`);
    } else if (language === 'php') {
      highlighted = highlighted.replace(/\/\/.*$/gm, `<span style="color:${colors.comment}">$&</span>`);
    }

    // Strings
    highlighted = highlighted.replace(/(&quot;|&#039;)(?:(?=(\\?))\2.)*?\1/g, `<span style="color:${colors.string}">$&</span>`);

    // Keywords JavaScript/Node.js
    if (language === 'javascript' || language === 'nodejs') {
      ['async', 'await', 'function', 'const', 'let', 'var', 'if', 'else', 'return', 'try', 'catch'].forEach(kw => {
        highlighted = highlighted.replace(new RegExp(`\\b${kw}\\b`, 'g'), `<span style="color:${colors.keyword}">${kw}</span>`);
      });
    }

    // Functions JavaScript/Node.js
    if (language === 'javascript' || language === 'nodejs') {
      ['fetch', 'console.log', 'console.error', 'JSON.stringify', 'JSON.parse'].forEach(fn => {
        highlighted = highlighted.replace(new RegExp(fn.replace('.', '\\.'), 'g'), `<span style="color:${colors.function}">${fn}</span>`);
      });
    }

    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, `<span style="color:${colors.number}">$1</span>`);

    return highlighted;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 max-md:py-2">
          <div className="flex items-center justify-between">
            <div className="transform scale-110 max-md:scale-100 origin-left">
              <Logo size="md" showText={false} />
            </div>
            <div className="flex items-center gap-2 max-md:gap-1.5">
              {isFromLanding ? (
                <Link
                  href="/"
                  className="px-3 max-md:px-2.5 py-1.5 max-md:py-1 text-xs max-md:text-[11px] font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all shadow-sm hover:shadow-md"
                >
                  Volver al inicio
                </Link>
              ) : (
                <>
                  <Link
                    href={`/dashboard/api-keys${urlSuffix}`}
                    className="px-3 max-md:px-2.5 py-1.5 max-md:py-1 text-xs max-md:text-[11px] font-medium text-[#2F7E7A] border border-[#2F7E7A] rounded-lg hover:bg-[#2F7E7A] hover:text-white transition-all shadow-sm hover:shadow-md"
                  >
                    Gestionar API Keys
                  </Link>
                  <Link
                    href={`/dashboard${urlSuffix}`}
                    className="px-3 max-md:px-2.5 py-1.5 max-md:py-1 text-xs max-md:text-[11px] font-medium bg-[#2F7E7A] text-white rounded-lg hover:bg-[#1F5D59] transition-all shadow-sm hover:shadow-md"
                  >
                    Ir al Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 max-md:py-4">
        {/* Hero Section */}
        <div className="text-center mb-8 max-md:mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 max-md:px-2.5 py-1 max-md:py-0.5 rounded-full bg-[#2F7E7A] bg-opacity-10 text-[#2F7E7A] text-xs max-md:text-[10px] font-semibold mb-4 max-md:mb-3">
            <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            API REST Documentation
          </div>
          <h1 className="text-2xl max-md:text-xl font-bold text-gray-700 mb-3 max-md:mb-2">
            Documentación de la API
          </h1>
          <p className="text-sm max-md:text-xs text-gray-600 max-w-3xl mx-auto mb-4 max-md:mb-3">
            Integra la validación de RFCs en tus aplicaciones con nuestra API REST. 
            Simple, rápida, confiable y lista para producción.
          </p>
          <div className="flex items-center justify-center gap-4 max-md:gap-3 text-xs max-md:text-[10px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Validación en tiempo real</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Respuesta en &lt;500ms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mb-6 max-md:mb-5">
          <div className="flex items-center gap-2 mb-4 max-md:mb-3">
            <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-lg max-md:text-base font-bold text-gray-700">Inicio Rápido</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-md:gap-3">
            <div className="bg-white rounded-lg p-4 max-md:p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 max-md:w-7 max-md:h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm max-md:text-xs mb-3 max-md:mb-2">
                1
              </div>
              <h3 className="text-sm max-md:text-xs font-semibold text-gray-600 mb-1.5 max-md:mb-1">Obtén tu API Key</h3>
              <p className="text-gray-600 text-xs max-md:text-[11px] mb-3 max-md:mb-2">
                Ve a tu Dashboard y crea una API Key en la sección{" "}
                <Link href={`/dashboard/api-keys${urlSuffix}`} className="text-[#2F7E7A] hover:underline font-medium">
                  API Keys
                </Link>
                . Solo disponible para planes Pro y Business.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 max-md:p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 max-md:w-7 max-md:h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm max-md:text-xs mb-3 max-md:mb-2">
                2
              </div>
              <h3 className="text-sm max-md:text-xs font-semibold text-gray-600 mb-1.5 max-md:mb-1">Endpoint</h3>
              <code className="block bg-gray-900 text-green-400 p-2 max-md:p-1.5 rounded-lg text-xs max-md:text-[11px] font-mono mb-2 max-md:mb-1.5">
                POST /api/public/validate
              </code>
              <p className="text-gray-600 text-xs max-md:text-[11px]">
                Endpoint único para todas las validaciones
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 max-md:p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 max-md:w-7 max-md:h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm max-md:text-xs mb-3 max-md:mb-2">
                3
              </div>
              <h3 className="text-sm max-md:text-xs font-semibold text-gray-600 mb-1.5 max-md:mb-1">Autenticación</h3>
              <code className="block bg-gray-900 text-purple-400 p-2 max-md:p-1.5 rounded-lg text-xs max-md:text-[11px] font-mono mb-2 max-md:mb-1.5">
                X-API-Key: sk_live_...
              </code>
              <p className="text-gray-600 text-xs max-md:text-[11px]">
                Incluye tu API Key en el header
              </p>
            </div>
          </div>
        </div>

        {/* Request/Response */}
          <div className="grid md:grid-cols-2 gap-4 max-md:gap-3 mb-6 max-md:mb-5">
          {/* Request */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3">
            <div className="flex items-center gap-2 mb-4 max-md:mb-3">
              <div className="w-8 h-8 max-md:w-7 max-md:h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-base max-md:text-sm font-bold text-gray-700">Request</h2>
            </div>
            <div className="space-y-3 max-md:space-y-2">
              <div>
                <p className="text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 max-md:w-1 max-md:h-1 bg-blue-500 rounded-full"></span>
                  Headers:
                </p>
                <pre className="p-3 max-md:p-2 rounded-lg text-xs max-md:text-[11px] font-mono overflow-x-auto" style={{ fontFamily: 'Consolas, "Courier New", monospace', backgroundColor: '#000000', color: '#ABB2BF' }}>
                  <code 
                    dangerouslySetInnerHTML={{ 
                      __html: highlightCode(`X-API-Key: sk_live_abc123...
Content-Type: application/json`, 'curl')
                    }} 
                  />
                </pre>
              </div>
              <div>
                <p className="text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 max-md:w-1 max-md:h-1 bg-green-500 rounded-full"></span>
                  Body:
                </p>
                <pre className="p-3 max-md:p-2 rounded-lg text-xs max-md:text-[11px] font-mono overflow-x-auto" style={{ fontFamily: 'Consolas, "Courier New", monospace', backgroundColor: '#000000', color: '#ABB2BF' }}>
                  <code 
                    dangerouslySetInnerHTML={{ 
                      __html: highlightCode(`{
  "rfc": "XAXX010101000"
}`, 'json')
                    }} 
                  />
                </pre>
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3">
            <div className="flex items-center gap-2 mb-4 max-md:mb-3">
              <div className="w-8 h-8 max-md:w-7 max-md:h-7 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-base max-md:text-sm font-bold text-gray-700">Response</h2>
            </div>
            <div className="space-y-3 max-md:space-y-2">
              <div>
                <p className="text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 max-md:w-1 max-md:h-1 bg-green-500 rounded-full"></span>
                  Success (200):
                </p>
                <pre className="p-3 max-md:p-2 rounded-lg text-xs max-md:text-[11px] font-mono overflow-x-auto" style={{ fontFamily: 'Consolas, "Courier New", monospace', backgroundColor: '#000000', color: '#ABB2BF' }}>
                  <code 
                    dangerouslySetInnerHTML={{ 
                      __html: highlightCode(`{
  "success": true,
  "valid": true,
  "rfc": "ABC123456789",
  "remaining": 1999,
  "message": "RFC válido",
  "source": "sat",
  "responseTime": 245
}`, 'json')
                    }} 
                  />
                </pre>
              </div>
              <div>
                <p className="text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 max-md:w-1 max-md:h-1 bg-red-500 rounded-full"></span>
                  Error (400/401):
                </p>
                <pre className="p-3 max-md:p-2 rounded-lg text-xs max-md:text-[11px] font-mono overflow-x-auto" style={{ fontFamily: 'Consolas, "Courier New", monospace', backgroundColor: '#000000', color: '#ABB2BF' }}>
                  <code 
                    dangerouslySetInnerHTML={{ 
                      __html: highlightCode(`{
  "success": false,
  "valid": false,
  "rfc": "",
  "remaining": 0,
  "message": "API Key requerida"
}`, 'json')
                    }} 
                  />
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-700">Ejemplos de Código</h2>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {Object.keys(codeExamples).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    selectedLanguage === lang
                      ? "bg-[#2F7E7A] text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {lang === "javascript" ? "JavaScript" : lang === "nodejs" ? "Node.js" : lang === "curl" ? "cURL" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples], selectedLanguage)}
              className="absolute top-3 right-3 px-3 py-1.5 text-xs font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all shadow-sm hover:shadow-md z-10 flex items-center gap-1.5"
            >
              {copiedCode === selectedLanguage ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </>
              )}
            </button>
            <pre className="p-4 rounded-lg overflow-x-auto" style={{ fontFamily: 'Consolas, "Courier New", monospace', backgroundColor: '#000000', color: '#ABB2BF' }}>
              <code 
                className="text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: highlightCode(
                    codeExamples[selectedLanguage as keyof typeof codeExamples],
                    selectedLanguage
                  ) 
                }}
              />
            </pre>
          </div>
        </div>

        {/* Resto del contenido... */}
        {/* API Reference */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-700">Referencia de la API</h2>
          </div>
          
          <div className="space-y-4">
            {/* Endpoint */}
            <div className="border-l-4 border-[#2F7E7A] pl-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#2F7E7A] rounded-full"></span>
                Endpoint
              </h3>
              <code className="block bg-gray-900 text-green-400 p-2 rounded-lg text-xs font-mono mb-2">
                POST /api/public/validate
              </code>
              <p className="text-xs text-gray-600">
                Valida un RFC consultando directamente al SAT (Sistema de Administración Tributaria). 
                La validación se realiza en tiempo real y retorna el estado actual del RFC en el padrón del SAT.
              </p>
            </div>

            {/* Authentication */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Autenticación
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Todas las solicitudes requieren una API Key válida. Inclúyela en el header de la siguiente manera:
              </p>
              <div className="bg-gray-900 rounded-lg p-2 mb-3">
                <code className="text-green-400 text-xs font-mono">
                  X-API-Key: sk_live_tu_api_key_aqui
                </code>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 flex items-start gap-1.5">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Alternativa:</strong> También puedes usar el header <code className="bg-blue-100 px-1 py-0.5 rounded text-[10px] font-mono">Authorization: Bearer tu_api_key</code> si prefieres el estándar OAuth 2.0.
                  </span>
                </p>
              </div>
            </div>

            {/* Parameters */}
            <div className="border-l-4 border-purple-500 pl-4 max-md:pl-3">
              <h3 className="text-sm max-md:text-xs font-semibold text-gray-600 mb-3 max-md:mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 max-md:w-1 max-md:h-1 bg-purple-500 rounded-full"></span>
                Parámetros
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 max-md:px-2 py-2 max-md:py-1.5 text-left text-xs max-md:text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Parámetro</th>
                        <th className="px-4 max-md:px-2 py-2 max-md:py-1.5 text-left text-xs max-md:text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                        <th className="px-4 max-md:px-2 py-2 max-md:py-1.5 text-left text-xs max-md:text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Requerido</th>
                        <th className="px-4 max-md:px-2 py-2 max-md:py-1.5 text-left text-xs max-md:text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap">
                          <code className="text-xs max-md:text-[11px] font-mono text-gray-900 bg-gray-100 px-1.5 max-md:px-1 py-0.5 rounded">rfc</code>
                        </td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600">string</td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 max-md:px-1.5 py-0.5 max-md:py-[2px] rounded-full text-xs max-md:text-[10px] font-medium bg-red-100 text-red-800">
                            Sí
                          </span>
                        </td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 text-xs max-md:text-[11px] text-gray-600 max-md:min-w-[200px]">
                          RFC a validar. Formato: <code className="bg-gray-100 px-1 max-md:px-0.5 py-0.5 rounded text-[10px] max-md:text-[9px]">ABC123456789</code> (12 o 13 caracteres)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Response Fields */}
            <div className="border-l-4 border-green-500 pl-4 max-md:pl-3">
              <h3 className="text-sm max-md:text-xs font-semibold text-gray-600 mb-3 max-md:mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 max-md:w-1 max-md:h-1 bg-green-500 rounded-full"></span>
                Campos de Respuesta
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 max-md:px-2 py-2 max-md:py-1.5 text-left text-xs max-md:text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Campo</th>
                        <th className="px-4 max-md:px-2 py-2 max-md:py-1.5 text-left text-xs max-md:text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                        <th className="px-4 max-md:px-2 py-2 max-md:py-1.5 text-left text-xs max-md:text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap">
                          <code className="text-xs max-md:text-[11px] font-mono text-gray-900 bg-gray-100 px-1.5 max-md:px-1 py-0.5 rounded">success</code>
                        </td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600">boolean</td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 text-xs max-md:text-[11px] text-gray-600 max-md:min-w-[200px]">Indica si la solicitud fue procesada exitosamente</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap">
                          <code className="text-xs max-md:text-[11px] font-mono text-gray-900 bg-gray-100 px-1.5 max-md:px-1 py-0.5 rounded">valid</code>
                        </td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600">boolean</td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 text-xs max-md:text-[11px] text-gray-600 max-md:min-w-[200px]">Indica si el RFC es válido según el padrón del SAT</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap">
                          <code className="text-xs max-md:text-[11px] font-mono text-gray-900 bg-gray-100 px-1.5 max-md:px-1 py-0.5 rounded">rfc</code>
                        </td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600">string</td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 text-xs max-md:text-[11px] text-gray-600 max-md:min-w-[200px]">RFC formateado y normalizado (sin guiones, mayúsculas)</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap">
                          <code className="text-xs max-md:text-[11px] font-mono text-gray-900 bg-gray-100 px-1.5 max-md:px-1 py-0.5 rounded">remaining</code>
                        </td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600">number</td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 text-xs max-md:text-[11px] text-gray-600 max-md:min-w-[200px]">Consultas restantes en tu plan para este mes (o -1 si es ilimitado)</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap">
                          <code className="text-xs max-md:text-[11px] font-mono text-gray-900 bg-gray-100 px-1.5 max-md:px-1 py-0.5 rounded">message</code>
                        </td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600">string</td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 text-xs max-md:text-[11px] text-gray-600 max-md:min-w-[200px]">Mensaje descriptivo del resultado de la validación</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap">
                          <code className="text-xs max-md:text-[11px] font-mono text-gray-900 bg-gray-100 px-1.5 max-md:px-1 py-0.5 rounded">source</code>
                        </td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600">string</td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 text-xs max-md:text-[11px] text-gray-600 max-md:min-w-[200px]">Fuente de la validación: <code className="bg-gray-100 px-1 max-md:px-0.5 py-0.5 rounded text-[10px] max-md:text-[9px]">&quot;sat&quot;</code> o <code className="bg-gray-100 px-1 max-md:px-0.5 py-0.5 rounded text-[10px] max-md:text-[9px]">&quot;error&quot;</code></td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap">
                          <code className="text-xs max-md:text-[11px] font-mono text-gray-900 bg-gray-100 px-1.5 max-md:px-1 py-0.5 rounded">responseTime</code>
                        </td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600">number</td>
                        <td className="px-4 max-md:px-2 py-3 max-md:py-2 text-xs max-md:text-[11px] text-gray-600 max-md:min-w-[200px]">Tiempo de respuesta en milisegundos desde la solicitud hasta la respuesta</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Rate Limits */}
            <div className="border-l-4 border-amber-500 pl-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Límites de Tasa
              </h3>
              <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1.5">Rate Limiting</h4>
                    <p className="text-xs text-amber-900/80 mb-2">
                      <strong>Límite:</strong> 60 solicitudes por minuto por API Key
                    </p>
                    <p className="text-xs text-amber-900/80 mb-2">
                      Headers informativos (en respuestas exitosas):
                    </p>
                    <div className="bg-white rounded-lg p-2 border border-amber-200/70">
                      <code className="text-[10px] font-mono text-gray-800 leading-relaxed">
                        X-RateLimit-Limit: 60<br />
                        X-RateLimit-Remaining: 45
                      </code>
                    </div>
                    <p className="text-xs text-amber-900/80 mt-2">
                      Si excedes el límite, recibirás <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px] font-mono">429 Too Many Requests</code> y el header{" "}
                      <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px] font-mono">Retry-After: 60</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Codes */}
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Códigos de Error
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código HTTP</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Solución</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          400
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">Solicitud inválida (RFC faltante o formato incorrecto)</td>
                      <td className="px-4 py-3 text-xs text-gray-500">Verifica que el RFC tenga 12 o 13 caracteres y formato válido</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          401
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">API Key faltante o inválida</td>
                      <td className="px-4 py-3 text-xs text-gray-500">Verifica que incluyas el header X-API-Key con una key válida</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          403
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">API Key desactivada, expirada o límite mensual alcanzado</td>
                      <td className="px-4 py-3 text-xs text-gray-500">Revisa el estado de tu API Key en el Dashboard o actualiza tu plan</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          429
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">Límite de tasa excedido (más de 60 requests/minuto)</td>
                      <td className="px-4 py-3 text-xs text-gray-500">Espera el tiempo indicado en el header Retry-After antes de reintentar</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          500
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">Error interno del servidor</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        Intenta nuevamente en unos momentos. Si persiste,{" "}
                        <a
                          href="mailto:soporte@maflipp.com"
                          className="text-[#2F7E7A] hover:underline"
                        >
                          contacta a nuestro equipo de soporte
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-700">Mejores Prácticas</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">Seguridad</h3>
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Nunca expongas tu API Key en código del frontend o repositorios públicos</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Usa variables de entorno para almacenar tus API Keys</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Rota tus API Keys periódicamente si sospechas compromiso</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Crea API Keys separadas para desarrollo y producción</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">Rendimiento</h3>
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Implementa caché para RFCs validados recientemente</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Usa procesamiento asíncrono para validaciones en lote</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Respeta los límites de tasa para evitar errores 429</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Monitorea tu uso mensual para evitar alcanzar el límite</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">Manejo de Errores</h3>
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Implementa retry logic con backoff exponencial para errores 429 y 500</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Valida el formato del RFC antes de enviarlo a la API</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Revisa siempre el campo <code className="bg-indigo-100 px-1 py-0.5 rounded text-[10px]">success</code> antes de usar los datos</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Registra errores para monitoreo y debugging</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-600">Optimización</h3>
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Agrupa múltiples validaciones en una sola solicitud cuando sea posible</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Usa conexiones HTTP persistentes (keep-alive)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Implementa timeouts apropiados (recomendado: 10 segundos)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Monitorea el campo <code className="bg-indigo-100 px-1 py-0.5 rounded text-[10px]">remaining</code> para gestionar tu cuota</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2F7E7A]/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#2F7E7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-700 tracking-tight">
                  Precios y Límites
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Resumen de cuotas para uso de API. Los límites mensuales se reinician el primer día de cada mes.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50/40 p-3">
              <h3 className="text-xs font-semibold text-gray-700 mb-1.5">Plan Pro</h3>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-lg font-semibold text-gray-900">${proPlan.monthlyPrice.toLocaleString()}</span>
                <span className="text-xs text-gray-500">MXN/mes</span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-start gap-1.5">
                  <span className="text-[#2F7E7A] mt-0.5">•</span>
                  <span>{(proPlan.features.apiCallsPerMonth || 0).toLocaleString()} llamadas/mes</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#2F7E7A] mt-0.5">•</span>
                  <span>Múltiples API Keys</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50/40 p-3">
              <h3 className="text-xs font-semibold text-gray-700 mb-1.5">Plan Business</h3>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-lg font-semibold text-gray-900">${businessPlan.monthlyPrice.toLocaleString()}</span>
                <span className="text-xs text-gray-500">MXN/mes</span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-start gap-1.5">
                  <span className="text-[#2F7E7A] mt-0.5">•</span>
                  <span>{(businessPlan.features.apiCallsPerMonth || 0).toLocaleString()} llamadas/mes</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#2F7E7A] mt-0.5">•</span>
                  <span>API Keys ilimitadas</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50/40 p-3">
              <h3 className="text-xs font-semibold text-gray-700 mb-1.5">Rate Limit</h3>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-lg font-semibold text-gray-900">60</span>
                <span className="text-xs text-gray-500">req/min</span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-start gap-1.5">
                  <span className="text-[#2F7E7A] mt-0.5">•</span>
                  <span>Por API Key</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[#2F7E7A] mt-0.5">•</span>
                  <span>Auto-reset cada minuto</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-[10px] text-gray-500">
              Consejo: monitorea <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] font-mono">remaining</code> para evitar cortes por límite mensual.
            </p>
            <Link
              href={isFromLanding ? "/pricing#comparativa" : `/dashboard/billing${urlSuffix}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F7E7A] text-white rounded-lg font-semibold hover:bg-[#1F5D59] transition-colors shadow-sm hover:shadow-md text-xs"
            >
              {isFromLanding ? "Ver comparativa completa" : "Gestionar plan y facturación"}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-700">Soporte y Recursos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Documentación</h3>
              <p className="text-xs text-gray-600 mb-3">
                Esta página contiene toda la información que necesitas para integrar nuestra API.
              </p>
              {!isFromLanding && (
                <Link
                  href={`/dashboard/help${urlSuffix}`}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  Ver FAQs
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">API Keys</h3>
              <p className="text-xs text-gray-600 mb-3">
                Gestiona tus API Keys, monitorea tu uso y crea nuevas claves desde tu Dashboard.
              </p>
              {!isFromLanding && (
                <Link
                  href={`/dashboard/api-keys${urlSuffix}`}
                  className="text-xs font-medium text-green-600 hover:text-green-800 inline-flex items-center gap-1"
                >
                  Gestionar API Keys
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Dashboard</h3>
              <p className="text-xs text-gray-600 mb-3">
                Accede a tu Dashboard para ver estadísticas, historial y configuraciones.
              </p>
              {!isFromLanding && (
                <Link
                  href={`/dashboard${urlSuffix}`}
                  className="text-xs font-medium text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
                >
                  Ir al Dashboard
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Maflipp. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <Suspense fallback={null}>
      <DevelopersPageContent />
    </Suspense>
  );
}
