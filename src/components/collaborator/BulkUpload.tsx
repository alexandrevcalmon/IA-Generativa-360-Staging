import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BulkCollaboratorData, CreateCollaboratorData, GenderOptions } from "@/hooks/collaborators/types";
import * as XLSX from 'xlsx';

interface BulkUploadProps {
  onSubmit: (collaborators: CreateCollaboratorData[]) => Promise<void>;
  isLoading: boolean;
  companyId: string;
  maxCollaborators: number;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({
  onSubmit,
  isLoading,
  companyId,
  maxCollaborators
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [validatedData, setValidatedData] = useState<CreateCollaboratorData[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = [
      {
        nome: "João Silva",
        email: "joao.silva@empresa.com",
        cargo: "Analista de Sistemas",
        telefone: "(11) 99999-9999"
      },
      {
        nome: "Maria Santos",
        email: "maria.santos@empresa.com", 
        cargo: "Gerente de Projetos",
        telefone: "(11) 88888-8888"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Colaboradores");
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 25 }, // nome
      { wch: 35 }, // email
      { wch: 25 }, // cargo
      { wch: 18 }  // telefone
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, "template_colaboradores_simplificado.xlsx");
    toast.success({
      title: "Template baixado!",
      description: "Use este arquivo como modelo para importar colaboradores. Apenas 4 campos necessários!"
    });
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return !isNaN(date.getTime()) && age >= 16 && age <= 100;
  };

  const validateGender = (gender: string): boolean => {
    return Object.keys(GenderOptions).includes(gender.toLowerCase());
  };

  const validateRowData = (row: BulkCollaboratorData, index: number): ValidationError[] => {
    const rowErrors: ValidationError[] = [];
    const rowNumber = index + 2; // +2 porque começamos da linha 2 (linha 1 é cabeçalho)

    if (!row.nome?.trim()) {
      rowErrors.push({ row: rowNumber, field: 'nome', message: 'Nome é obrigatório' });
    }

    if (!row.email?.trim()) {
      rowErrors.push({ row: rowNumber, field: 'email', message: 'E-mail é obrigatório' });
    } else if (!validateEmail(row.email.trim())) {
      rowErrors.push({ row: rowNumber, field: 'email', message: 'E-mail inválido' });
    }

    if (!row.cargo?.trim()) {
      rowErrors.push({ row: rowNumber, field: 'cargo', message: 'Cargo é obrigatório' });
    }

    // Telefone é opcional, mas se fornecido, deve ter formato básico
    if (row.telefone && row.telefone.trim() && row.telefone.trim().length < 10) {
      rowErrors.push({ row: rowNumber, field: 'telefone', message: 'Telefone deve ter pelo menos 10 dígitos' });
    }

    return rowErrors;
  };

  const processFile = async (file: File) => {
    console.log('🔄 Iniciando processamento do arquivo:', file.name);
    setIsValidating(true);
    setErrors([]);
    setValidatedData([]);

    try {
      console.log('📖 Lendo arquivo como arrayBuffer...');
      const data = await file.arrayBuffer();
      console.log('✅ ArrayBuffer criado, tamanho:', data.byteLength);
      
      console.log('📊 Processando Excel...');
      const workbook = XLSX.read(data, { type: 'array' });
      console.log('📊 Workbook criado, sheets:', workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      console.log('📋 Usando sheet:', sheetName);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as BulkCollaboratorData[];
      console.log('📋 Dados extraídos do Excel:', jsonData);
      console.log('📋 Quantidade de linhas:', jsonData.length);

      if (jsonData.length === 0) {
        console.log('❌ Arquivo vazio');
        toast.error({
          title: "Arquivo vazio",
          description: "O arquivo não contém dados para processar."
        });
        return;
      }

      if (jsonData.length > maxCollaborators) {
        console.log('❌ Limite excedido:', jsonData.length, '>', maxCollaborators);
        toast.error({
          title: "Limite excedido",
          description: `O arquivo contém ${jsonData.length} colaboradores, mas o limite do plano é ${maxCollaborators}.`
        });
        return;
      }

      console.log('🔍 Iniciando validação das linhas...');
      // Validar cada linha
      const allErrors: ValidationError[] = [];
      const validData: CreateCollaboratorData[] = [];

      // Verificar emails duplicados
      const emailSet = new Set<string>();
      
      jsonData.forEach((row, index) => {
        console.log(`🔍 Validando linha ${index + 2}:`, row);
        const rowErrors = validateRowData(row, index);
        
        // Verificar email duplicado
        if (row.email && emailSet.has(row.email.toLowerCase())) {
          rowErrors.push({
            row: index + 2,
            field: 'email',
            message: 'E-mail duplicado no arquivo'
          });
        } else if (row.email) {
          emailSet.add(row.email.toLowerCase());
        }

        allErrors.push(...rowErrors);

        // Se não há erros na linha, adicionar aos dados válidos
        if (rowErrors.length === 0) {
          console.log(`✅ Linha ${index + 2} válida`);
          validData.push({
            company_id: companyId,
            name: row.nome.trim(),
            email: row.email.trim().toLowerCase(),
            phone: row.telefone?.trim() || null,
            position: row.cargo.trim(),
            // Campos que serão preenchidos na ativação
            needs_complete_registration: true
          });
        } else {
          console.log(`❌ Linha ${index + 2} com erros:`, rowErrors);
        }
      });

      console.log('📊 Resultado da validação:');
      console.log('📊 Total de erros:', allErrors.length);
      console.log('📊 Total de dados válidos:', validData.length);

      setErrors(allErrors);
      setValidatedData(validData);

      if (allErrors.length === 0) {
        console.log('✅ Validação bem-sucedida!');
        toast.success({
          title: "Validação concluída!",
          description: `${validData.length} colaboradores prontos para importação.`
        });
      } else {
        console.log('❌ Erros encontrados na validação');
        toast.error({
          title: "Erros encontrados",
          description: `${allErrors.length} erros encontrados. Corrija-os antes de importar.`
        });
      }

    } catch (error) {
      console.error("❌ Erro ao processar arquivo:", error);
      toast.error({
        title: "Erro ao processar arquivo",
        description: "Verifique se o arquivo está no formato correto."
      });
    } finally {
      setIsValidating(false);
      console.log('🏁 Processamento finalizado');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 handleFileChange chamada!');
    const selectedFile = event.target.files?.[0];
    console.log('📁 Arquivo selecionado:', selectedFile);
    
    if (selectedFile) {
      console.log('📁 Nome do arquivo:', selectedFile.name);
      console.log('📁 Tamanho do arquivo:', selectedFile.size);
      
      if (!selectedFile.name.endsWith('.xlsx')) {
        console.log('❌ Formato inválido:', selectedFile.name);
        toast.error({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo .xlsx"
        });
        return;
      }
      
      console.log('✅ Arquivo válido, definindo estado e processando...');
      setFile(selectedFile);
      processFile(selectedFile);
    } else {
      console.log('❌ Nenhum arquivo selecionado');
    }
  };

  const handleSubmit = async () => {
    if (validatedData.length === 0) return;

    try {
      await onSubmit(validatedData);
      setFile(null);
      setValidatedData([]);
      setErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error submitting bulk data:", error);
    }
  };

  const clearFile = () => {
    setFile(null);
    setValidatedData([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileSpreadsheet className="h-5 w-5 text-green-400" />
          Importação em Massa
        </CardTitle>
        <CardDescription className="text-slate-300">
          Importe múltiplos colaboradores usando um arquivo Excel (.xlsx). 
          Máximo de {maxCollaborators} colaboradores por vez.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2 bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-500/50 transition-all duration-300"
          >
            <Download className="h-4 w-4" />
            Baixar Modelo (Template)
          </Button>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-6 text-center bg-slate-700/30 hover:border-slate-500/50 transition-all duration-300">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4 hover:text-slate-300 transition-colors duration-300" />
            <p className="text-lg font-medium text-slate-200 mb-2">
              Clique para selecionar o arquivo
            </p>
            <p className="text-sm text-slate-400">
              Apenas arquivos .xlsx são aceitos
            </p>
          </label>
        </div>

        {/* File Info */}
        {file && (
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-blue-400" />
              <div>
                <p className="font-medium text-slate-200">{file.name}</p>
                <p className="text-sm text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFile}
              className="text-slate-400 hover:text-white hover:bg-slate-600/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Validation Progress */}
        {isValidating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">Validando arquivo...</span>
              <span className="text-sm text-slate-400">Processando</span>
            </div>
            <Progress value={uploadProgress} className="h-2 bg-slate-700/50" />
          </div>
        )}

        {/* Validation Results */}
        {validatedData.length > 0 && (
          <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-200">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <AlertDescription>
              <strong>{validatedData.length} colaboradores</strong> validados e prontos para importação.
            </AlertDescription>
          </Alert>
        )}

        {/* Resumo dos colaboradores válidos */}
        {validatedData.length > 0 && (
          <div className="my-4">
            <h4 className="font-semibold mb-2 text-slate-200">Colaboradores prontos para importação:</h4>
            <ul className="list-disc ml-6 text-sm text-slate-300 space-y-1">
              {validatedData.map((colab, idx) => (
                <li key={idx}>{colab.name} ({colab.email})</li>
              ))}
            </ul>
          </div>
        )}

        {/* Erros de validação */}
        {errors.length > 0 && (
          <div className="my-4">
            <h4 className="font-semibold text-red-400 mb-2">Erros encontrados:</h4>
            <ul className="list-disc ml-6 text-sm text-red-400 space-y-1">
              {errors.map((err, idx) => (
                <li key={idx}>Linha {err.row}: {err.field} - {err.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Botão de importação */}
        <Button
          className="mt-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          disabled={validatedData.length === 0 || errors.length > 0 || isLoading}
          onClick={async () => {
            console.log('🚀 Botão Importar clicado!');
            console.log('📊 Dados validados:', validatedData);
            console.log('📊 Quantidade:', validatedData.length);
            console.log('🔄 isLoading:', isLoading);
            
            if (!onSubmit) {
              console.error('❌ Função onSubmit não foi passada!');
              return;
            }
            
            setUploadProgress(0);
            setIsValidating(true);
            try {
              console.log('📤 Chamando onSubmit...');
              await onSubmit(validatedData);
              console.log('✅ onSubmit concluído!');
              toast.success({ title: 'Importação concluída!', description: `${validatedData.length} colaboradores importados com sucesso.` });
              setValidatedData([]);
              setFile(null);
            } catch (error) {
              console.error('❌ Erro na importação:', error);
              toast.error({ title: 'Erro na importação', description: 'Ocorreu um erro ao importar os colaboradores.' });
            } finally {
              setIsValidating(false);
            }
          }}
        >
          {isLoading ? 'Importando...' : 'Importar Colaboradores'}
        </Button>
      </CardContent>
    </Card>
  );
};
