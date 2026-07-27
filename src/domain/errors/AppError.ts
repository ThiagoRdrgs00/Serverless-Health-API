export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  readonly erro: string;

  constructor(erro: string, mensagem: string) {
    super(mensagem);
    this.erro = erro;
    this.name = this.constructor.name;
  }
}
