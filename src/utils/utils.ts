// display an error message and exit
export const panic = (message: string): void => {
  console.error(message);
  process.exit(1);
};
