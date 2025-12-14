"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/layout/Logo";

export default function DevelopersPage() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");

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

  // Usar useMemo para recalcular ejemplos después del mount
  const codeExamples = useMemo(() => ({
    javascript: `// Validar RFC con JavaScript (Fetch API)
async function validateRFC(rfc, apiKey) {
  try {
    const response = await fetch('${apiEndpoint}', {
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
validateRFC('ABC123456789', 'tu-api-key-aqui');`,

    nodejs: `// Validar RFC con Node.js
const https = require('https');

function validateRFC(rfc, apiKey) {
  const data = JSON.stringify({ rfc: rfc });
  
  const options = {
    hostname: '${baseUrlForExamples.replace(/https?:\/\//, '')}',
    path: '/api/public/validate',
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Uso
validateRFC('ABC123456789', 'tu-api-key-aqui')
  .then(result => console.log(result))
  .catch(error => console.error(error));`,

    python: `# Validar RFC con Python
import requests
import json

def validate_rfc(rfc, api_key):
    url = '${apiEndpoint}'
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
result = validate_rfc('ABC123456789', 'tu-api-key-aqui')`,

    php: `<?php
// Validar RFC con PHP
function validateRFC($rfc, $apiKey) {
    $url = '${apiEndpoint}';
    
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
validateRFC('ABC123456789', 'tu-api-key-aqui');
?>`,

    curl: `# Validar RFC con cURL
curl -X POST '${apiEndpoint}' \\
  -H 'X-API-Key: tu-api-key-aqui' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "rfc": "ABC123456789"
  }'`,

    java: `// Validar RFC con Java
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.*;

public class MaflippAPI {
    public static String validateRFC(String rfc, String apiKey) throws IOException {
        URL url = new URL("${apiEndpoint}");
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
            String result = validateRFC("ABC123456789", "tu-api-key-aqui");
            System.out.println(result);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}`,
  }), [baseUrlForExamples, mounted]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="transform scale-125 origin-left">
              <Logo size="md" showText={false} />
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/api-keys${urlSuffix}`}
                className="px-4 py-2 text-sm font-medium text-[#2F7E7A] border border-[#2F7E7A] rounded-xl hover:bg-[#2F7E7A] hover:text-white transition-all shadow-sm hover:shadow-md"
              >
                Gestionar API Keys
              </Link>
              <Link
                href={`/dashboard${urlSuffix}`}
                className="px-4 py-2 text-sm font-medium bg-[#2F7E7A] text-white rounded-xl hover:bg-[#1F5D59] transition-all shadow-md hover:shadow-lg"
              >
                Ir al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2F7E7A] bg-opacity-10 text-[#2F7E7A] text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            API REST Documentation
          </div>
          <h1 className="text-4xl font-bold text-gray-700 mb-6">
            Documentación de la API
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Integra la validación de RFCs en tus aplicaciones con nuestra API REST. 
            Simple, rápida, confiable y lista para producción.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Validación en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Respuesta en &lt;500ms</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-6 h-6 text-[#2F7E7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700">Inicio Rápido</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-semibold text-gray-600 mb-2">Obtén tu API Key</h3>
              <p className="text-gray-600 text-sm mb-4">
                Ve a tu Dashboard y crea una API Key en la sección{" "}
                <Link href={`/dashboard/api-keys${urlSuffix}`} className="text-[#2F7E7A] hover:underline font-medium">
                  API Keys
                </Link>
                . Solo disponible para planes Pro y Business.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-semibold text-gray-600 mb-2">Endpoint</h3>
              <code className="block bg-gray-900 text-green-400 p-3 rounded-lg text-sm font-mono mb-2">
                POST /api/public/validate
              </code>
              <p className="text-gray-600 text-sm">
                Endpoint único para todas las validaciones
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-semibold text-gray-600 mb-2">Autenticación</h3>
              <code className="block bg-gray-900 text-purple-400 p-3 rounded-lg text-sm font-mono mb-2">
                X-API-Key: sk_live_...
              </code>
              <p className="text-gray-600 text-sm">
                Incluye tu API Key en el header
              </p>
            </div>
          </div>
        </div>

        {/* Request/Response */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Request */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-700">Request</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Headers:
                </p>
                <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ fontFamily: 'Consolas, "Courier New", monospace', backgroundColor: '#000000', color: '#ABB2BF' }}>
                  <code 
                    dangerouslySetInnerHTML={{ 
                      __html: highlightCode(`X-API-Key: sk_live_abc123...
Content-Type: application/json`, 'curl')
                    }} 
                  />
                </pre>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Body:
                </p>
                <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ fontFamily: 'Consolas, "Courier New", monospace', backgroundColor: '#000000', color: '#ABB2BF' }}>
                  <code 
                    dangerouslySetInnerHTML={{ 
                      __html: highlightCode(`{
  "rfc": "ABC123456789"
}`, 'json')
                    }} 
                  />
                </pre>
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-700">Response</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Success (200):
                </p>
                <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ fontFamily: 'Consolas, "Courier New", monospace', backgroundColor: '#000000', color: '#ABB2BF' }}>
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
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Error (400/401):
                </p>
                <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ fontFamily: 'Consolas, "Courier New", monospace', backgroundColor: '#000000', color: '#ABB2BF' }}>
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-700">Ejemplos de Código</h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(codeExamples).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                    selectedLanguage === lang
                      ? "bg-[#2F7E7A] text-white shadow-md"
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
              className="absolute top-4 right-4 px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all shadow-md hover:shadow-lg z-10 flex items-center gap-2"
            >
              {copiedCode === selectedLanguage ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </>
              )}
            </button>
            <pre className="p-8 rounded-xl overflow-x-auto" style={{ fontFamily: 'Consolas, "Courier New", monospace', backgroundColor: '#000000', color: '#ABB2BF' }}>
              <code 
                className="text-sm leading-relaxed"
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-700">Referencia de la API</h2>
          </div>
          
          <div className="space-y-8">
            {/* Endpoint */}
            <div className="border-l-4 border-[#2F7E7A] pl-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#2F7E7A] rounded-full"></span>
                Endpoint
              </h3>
              <code className="block bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono mb-3">
                POST /api/public/validate
              </code>
              <p className="text-gray-600">
                Valida un RFC consultando directamente al SAT (Sistema de Administración Tributaria). 
                La validación se realiza en tiempo real y retorna el estado actual del RFC en el padrón del SAT.
              </p>
            </div>

            {/* Authentication */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Autenticación
              </h3>
              <p className="text-gray-600 mb-4">
                Todas las solicitudes requieren una API Key válida. Inclúyela en el header de la siguiente manera:
              </p>
              <div className="bg-gray-900 rounded-xl p-4 mb-4">
                <code className="text-green-400 text-sm font-mono">
                  X-API-Key: sk_live_tu_api_key_aqui
                </code>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>Alternativa:</strong> También puedes usar el header <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">Authorization: Bearer tu_api_key</code> si prefieres el estándar OAuth 2.0.
                  </span>
                </p>
              </div>
            </div>

            {/* Parameters */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Parámetros
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Parámetro</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Requerido</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">rfc</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Sí
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        RFC a validar. Formato: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">ABC123456789</code> (12 o 13 caracteres)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Response Fields */}
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Campos de Respuesta
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Campo</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">success</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">boolean</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Indica si la solicitud fue procesada exitosamente</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">valid</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">boolean</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Indica si el RFC es válido según el padrón del SAT</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">rfc</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                      <td className="px-6 py-4 text-sm text-gray-600">RFC formateado y normalizado (sin guiones, mayúsculas)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">remaining</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">number</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Consultas restantes en tu plan para este mes (o -1 si es ilimitado)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">message</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Mensaje descriptivo del resultado de la validación</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">source</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">string</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Fuente de la validación: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">"sat"</code> o <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">"error"</code></td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">responseTime</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">number</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Tiempo de respuesta en milisegundos desde la solicitud hasta la respuesta</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rate Limits */}
            <div className="border-l-4 border-amber-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Límites de Tasa
              </h3>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-amber-900 mb-2">Rate Limiting</h4>
                    <p className="text-sm text-amber-800 mb-3">
                      <strong>Límite:</strong> 60 solicitudes por minuto por API Key
                    </p>
                    <p className="text-sm text-amber-800 mb-3">
                      Los headers de respuesta incluyen información sobre los límites:
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <code className="text-xs font-mono text-gray-800">
                        X-RateLimit-Limit: 60<br />
                        X-RateLimit-Remaining: 45<br />
                        X-RateLimit-Reset: 1640995200
                      </code>
                    </div>
                    <p className="text-sm text-amber-800 mt-3">
                      Si excedes el límite, recibirás un error <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">429 Too Many Requests</code> con un header <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">Retry-After</code> indicando cuántos segundos esperar.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Codes */}
            <div className="border-l-4 border-red-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Códigos de Error
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Código HTTP</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Descripción</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Solución</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          400
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">Solicitud inválida (RFC faltante o formato incorrecto)</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Verifica que el RFC tenga 12 o 13 caracteres y formato válido</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          401
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">API Key faltante o inválida</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Verifica que incluyas el header X-API-Key con una key válida</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          403
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">API Key desactivada, expirada o límite mensual alcanzado</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Revisa el estado de tu API Key en el Dashboard o actualiza tu plan</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          429
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">Límite de tasa excedido (más de 60 requests/minuto)</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Espera el tiempo indicado en el header Retry-After antes de reintentar</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          500
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">Error interno del servidor</td>
                      <td className="px-6 py-4 text-sm text-gray-500">Intenta nuevamente en unos momentos. Si persiste, contacta soporte</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-xl border border-indigo-200 p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-700">Mejores Prácticas</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-600">Seguridad</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Nunca expongas tu API Key en código del frontend o repositorios públicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Usa variables de entorno para almacenar tus API Keys</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Rota tus API Keys periódicamente si sospechas compromiso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Crea API Keys separadas para desarrollo y producción</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-600">Rendimiento</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Implementa caché para RFCs validados recientemente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Usa procesamiento asíncrono para validaciones en lote</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Respeta los límites de tasa para evitar errores 429</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Monitorea tu uso mensual para evitar alcanzar el límite</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-600">Manejo de Errores</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Implementa retry logic con backoff exponencial para errores 429 y 500</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Valida el formato del RFC antes de enviarlo a la API</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Revisa siempre el campo <code className="bg-indigo-100 px-1 py-0.5 rounded text-xs">success</code> antes de usar los datos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Registra errores para monitoreo y debugging</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-600">Optimización</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Agrupa múltiples validaciones en una sola solicitud cuando sea posible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Usa conexiones HTTP persistentes (keep-alive)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Implementa timeouts apropiados (recomendado: 10 segundos)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Monitorea el campo <code className="bg-indigo-100 px-1 py-0.5 rounded text-xs">remaining</code> para gestionar tu cuota</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-[#2F7E7A] via-[#1F5D59] to-[#2F7E7A] rounded-2xl shadow-2xl p-10 text-white mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold">Precios y Límites</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <h3 className="text-xl font-semibold mb-3">Plan Pro</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold">$299</span>
                <span className="text-lg opacity-90">MXN/mes</span>
              </div>
              <div className="space-y-2 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>2,000 llamadas/mes</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Múltiples API Keys</span>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <h3 className="text-xl font-semibold mb-3">Plan Business</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold">$999</span>
                <span className="text-lg opacity-90">MXN/mes</span>
              </div>
              <div className="space-y-2 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>10,000 llamadas/mes</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>API Keys ilimitadas</span>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <h3 className="text-xl font-semibold mb-3">Rate Limit</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold">60</span>
                <span className="text-lg opacity-90">req/min</span>
              </div>
              <div className="space-y-2 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Por API Key</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Auto-reset cada minuto</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Link
              href={`/dashboard/billing${urlSuffix}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2F7E7A] rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Ver Planes y Precios Completos
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-700">Soporte y Recursos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-base font-semibold text-gray-600 mb-3">Documentación</h3>
              <p className="text-sm text-gray-600 mb-4">
                Esta página contiene toda la información que necesitas para integrar nuestra API.
              </p>
              <Link
                href={`/dashboard/help${urlSuffix}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                Ver FAQs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-base font-semibold text-gray-600 mb-3">API Keys</h3>
              <p className="text-sm text-gray-600 mb-4">
                Gestiona tus API Keys, monitorea tu uso y crea nuevas claves desde tu Dashboard.
              </p>
              <Link
                href={`/dashboard/api-keys${urlSuffix}`}
                className="text-sm font-medium text-green-600 hover:text-green-800 inline-flex items-center gap-1"
              >
                Gestionar API Keys
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-base font-semibold text-gray-600 mb-3">Dashboard</h3>
              <p className="text-sm text-gray-600 mb-4">
                Accede a tu Dashboard para ver estadísticas, historial y configuraciones.
              </p>
              <Link
                href={`/dashboard${urlSuffix}`}
                className="text-sm font-medium text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
              >
                Ir al Dashboard
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
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
