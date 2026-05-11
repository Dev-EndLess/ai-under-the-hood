/**
 * Helper per ottenere la data corrente formattata
 */
const getCurrentDate = () => {
  return new Date().toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export { getCurrentDate };