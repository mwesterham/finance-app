export interface IParser<I, O> {
  parse(input: I): O;
}