import bcrypt from 'bcrypt';


const isHashed = (password: string): boolean => {
    const bcryptHashRegex = /^\$2[ayb]\$.{56}$/;
    return bcryptHashRegex.test(password);
  };

  const measureCompareTime = async (password: string, hash: string): Promise<number> => {
    const start = process.hrtime();
    try {
      await bcrypt.compare(password, hash);
    } catch (error) {
      console.error(`Error comparing password:`, error);
    }
    const end = process.hrtime(start);
    return end[0] * 1000 + end[1] / 1000000; // Convert to milliseconds
  };
  
  const hashAndComparePassword = async (password: string) => {
    const results: { rounds: number, time: number }[] = [];
    for (let rounds = 1; rounds <= 15; rounds++) {
      try {
        const hash = await bcrypt.hash(password, rounds);
        const time = await measureCompareTime(password, hash);
        results.push({ rounds, time });
      } catch (error) {
        console.error(`Error hashing or comparing with saltOrRounds=${rounds}:`, error);
      }
    }
    console.table(results);
  };
  
  // Example usage
  const testPassword = 'password'; // Replace with your actual password
  hashAndComparePassword(testPassword).then(() => {
    console.log('Hashing and comparing with different saltOrRounds completed.');
  });