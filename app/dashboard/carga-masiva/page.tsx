'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

export default function BulkUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setError(null);
        setResults(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            if (!data) return;

            if (selectedFile.name.endsWith('.csv')) {
                const text = data as string;
                const rfcs = text.split(/\r?\n/).map(line => line.trim()).filter(line => line && line.length >= 10);
                setPreview(rfcs.slice(0, 5));
            } else {
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
                const rfcs = jsonData.flat().map(cell => String(cell).trim()).filter(cell => cell && cell.length >= 10);
                setPreview(rfcs.slice(0, 5));
            }
        };

        if (selectedFile.name.endsWith('.csv')) {
            reader.readAsText(selectedFile);
        } else {
            reader.readAsBinaryString(selectedFile);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxFiles: 1
    });

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/validate/bulk', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar el archivo');
            }

            setResults(data.results);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Carga Masiva de RFCs</h1>
                <p className="text-gray-600 mt-2">Sube un archivo Excel o CSV para validar cientos de RFCs en segundos.</p>
            </div>

            {!results ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-300 hover:border-brand-primary'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {isDragActive ? (
                                <p className="text-lg text-brand-primary font-medium">Suelta el archivo aquí...</p>
                            ) : (
                                <>
                                    <p className="text-lg text-gray-700 font-medium">Arrastra y suelta tu archivo aquí</p>
                                    <p className="text-sm text-gray-500 mt-1">o haz clic para seleccionar (CSV, Excel)</p>
                                </>
                            )}
                        </div>
                    </div>

                    {file && (
                        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {preview.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Vista previa (primeros 5):</p>
                                    <div className="bg-gray-800 text-gray-200 p-3 rounded-lg text-xs font-mono">
                                        {preview.map((rfc, i) => (
                                            <div key={i}>{rfc}</div>
                                        ))}
                                        {preview.length === 5 && <div className="text-gray-500 mt-1">...</div>}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Iniciar Validación
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Resultados del Proceso</h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setResults(null);
                                        setFile(null);
                                        setPreview([]);
                                    }}
                                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                >
                                    Validar otro archivo
                                </button>
                                <button
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Descargar Excel
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Total Procesados</p>
                                <p className="text-2xl font-bold text-gray-900">{results.length}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <p className="text-xs text-green-600 uppercase font-semibold">Válidos</p>
                                <p className="text-2xl font-bold text-green-700">{results.filter((r: any) => r.is_valid && r.blacklist_status === 'CLEAN').length}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <p className="text-xs text-red-600 uppercase font-semibold">Inválidos</p>
                                <p className="text-2xl font-bold text-red-700">{results.filter((r: any) => !r.is_valid).length}</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <p className="text-xs text-orange-600 uppercase font-semibold">Listas Negras</p>
                                <p className="text-2xl font-bold text-orange-700">{results.filter((r: any) => r.blacklist_status !== 'CLEAN').length}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFC</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estructura</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus SAT</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {results.slice(0, 100).map((result: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.rfc}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {result.is_valid ? (
                                                    <span className="text-green-600 font-semibold">Válido</span>
                                                ) : (
                                                    <span className="text-red-600 font-semibold">Inválido</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {result.blacklist_status === 'CLEAN' ? (
                                                    <span className="text-gray-500">Limpio</span>
                                                ) : (
                                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">
                                                        {result.blacklist_status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {results.length > 100 && (
                                <div className="p-4 bg-gray-50 text-center text-sm text-gray-500 border-t border-gray-200">
                                    Mostrando los primeros 100 resultados. Descarga el Excel para ver todos.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
