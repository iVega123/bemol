import { Resolver, Query, Arg, ObjectType, Field } from "type-graphql";
import { PrismaClient } from "@prisma/client";
import fetch from "cross-fetch";

const prisma = new PrismaClient();

const headers = {
  "content-type": "application/json",
};

const options = {
  method: "GET",
  headers: headers,
};

@ObjectType()
class CepResponse {
  @Field()
  cep: string;
  @Field()
  logradouro: string;
  @Field()
  complemento: string;
  @Field()
  bairro: string;
  @Field()
  localidade: string;
  @Field()
  uf: string;
}

async function fetchResponseByURL(relativeURL) {
  return await fetch(`${process.env.URL_CEP}${relativeURL}/json/`).then((res) =>
    res.json()
  );
}

@Resolver()
export class CepResolver {
  @Query(() => String)
  async debug() {
    return "Debug";
  }
  @Query(() => CepResponse)
  async GetCep(@Arg("cep") cep: string) {
    try {
      var response = await fetchResponseByURL(cep);
      return {
        cep: response.cep,
        logradouro: response.logradouro,
        complemento: response.complemento,
        bairro: response.bairro,
        localidade: response.localidade,
        uf: response.uf,
      };
    } catch (err) {
      return false;
    }
  }
}
