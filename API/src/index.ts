import "reflect-metadata";
import * as tq from "type-graphql";
import { ApolloServer } from "apollo-server";
import { resolvers } from "@generated/type-graphql";
import { stitchSchemas } from "@graphql-tools/stitch";
import { PrismaClient } from "@prisma/client";
import { AuthResolver } from "../resolver/AuthResolver";
import { CepResolver } from "../resolver/CepResolver";

const prisma = new PrismaClient();

const corsOptions = {
  origin: ["http://localhost:3000", "https://studio.apollographql.com"],
};

const app = async () => {
  const CrudSchema = await tq.buildSchema({ resolvers: resolvers });
  const ExtraSchema = await tq.buildSchema({
    resolvers: [AuthResolver, CepResolver],
  });

  const gatewaySchema = stitchSchemas({
    subschemas: [CrudSchema, ExtraSchema],
  });

  new ApolloServer({
    schema: gatewaySchema,
    context: ({ req, res }) => ({ req, res, prisma: prisma }),
    cors: corsOptions,
  }).listen({ port: 4000 }, () =>
    console.log("🚀 Server ready at: http://localhost:4000")
  );
};

app();
