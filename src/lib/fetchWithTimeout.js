// Utilidad para fetch con timeout (Promise.race)
export const fetchWithTimeout = async (supabaseCall, timeoutMs = 8000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('timeout')), timeoutMs);
  });
  try {
    const result = await Promise.race([supabaseCall(), timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
};
