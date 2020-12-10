// display an error message and exit
export const panic = (message: string): never => {
  console.error(message);
  process.exit(1);
};
