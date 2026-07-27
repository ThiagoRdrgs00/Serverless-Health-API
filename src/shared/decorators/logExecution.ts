export function logExecution<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Promise<Return>,
  context: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Promise<Return>
  >,
): (this: This, ...args: Args) => Promise<Return> {
  const nomeDoMetodo = String(context.name);

  return async function (this: This, ...args: Args): Promise<Return> {
    const nomeDaClasse = (this as { constructor: { name: string } }).constructor
      .name;
    const identificador = `${nomeDaClasse}.${nomeDoMetodo}`;
    const inicio = Date.now();
    console.log(`[UseCase] ${identificador} iniciado`);

    try {
      const resultado = await target.call(this, ...args);
      console.log(
        `[UseCase] ${identificador} concluído em ${Date.now() - inicio}ms`,
      );
      return resultado;
    } catch (error) {
      console.log(
        `[UseCase] ${identificador} falhou em ${Date.now() - inicio}ms`,
      );
      throw error;
    }
  };
}
