// Função para converter segundos para formato MM:SS
export const secondsToTimeString = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds <= 0) return "0:00";
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Função para converter segundos para minutos decimais
export const secondsToMinutes = (totalSeconds: number): number => {
  if (!totalSeconds || totalSeconds <= 0) return 0;
  return totalSeconds / 60;
};

// Função para converter minutos decimais para segundos
export const minutesToSeconds = (minutes: number): number => {
  if (!minutes || minutes <= 0) return 0;
  return Math.round(minutes * 60);
};

// Função para formatar duração para exibição (ex: "5min" ou "5:30")
export const formatDuration = (totalSeconds: number, format: 'short' | 'long' = 'short'): string => {
  if (!totalSeconds || totalSeconds <= 0) return "";
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (format === 'short') {
    // Se tem segundos, mostra MM:SS, senão mostra apenas Xmin
    return seconds > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${minutes}min`;
  } else {
    // Formato longo: "5 minutos" ou "5 minutos e 30 segundos"
    if (seconds > 0) {
      return `${minutes} minutos e ${seconds} segundos`;
    } else {
      return `${minutes} minutos`;
    }
  }
}; 