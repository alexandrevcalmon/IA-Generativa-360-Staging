/**
 * Valida se um CNPJ é válido
 * @param cnpj - CNPJ a ser validado (com ou sem formatação)
 * @returns boolean - true se válido, false se inválido
 */
export function validateCNPJ(cnpj: string): boolean {
    // Remove caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, '');

    // Verifica se tem 14 dígitos
    if (cleanCNPJ.length !== 14) {
        return false;
    }

    // Verifica se todos os dígitos são iguais (casos inválidos)
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
        return false;
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    let weight = 5;

    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanCNPJ[i]) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }

    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCNPJ[12]) !== firstDigit) {
        return false;
    }

    // Validação do segundo dígito verificador
    sum = 0;
    weight = 6;

    for (let i = 0; i < 13; i++) {
        sum += parseInt(cleanCNPJ[i]) * weight;
        weight = weight === 2 ? 9 : weight - 1;
    }

    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cleanCNPJ[13]) === secondDigit;
}

/**
 * Formata um CNPJ adicionando pontos, barra e hífen
 * @param cnpj - CNPJ a ser formatado
 * @returns string - CNPJ formatado
 */
export function formatCNPJ(cnpj: string): string {
    // Remove tudo que não for dígito
    let value = cnpj.replace(/\D/g, "");

    // Limita a 14 dígitos
    value = value.substring(0, 14);

    // Aplica a máscara
    value = value.replace(/(\d{2})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1/$2");
    value = value.replace(/(\d{4})(\d{1,2})$/, "$1-$2");

    return value;
}