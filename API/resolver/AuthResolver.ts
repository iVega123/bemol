import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
} from "type-graphql";
import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const headers = {
  "content-type": "application/json",
};

const options = {
  method: "GET",
  headers: headers,
};

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver()
export class AuthResolver {
  @Query(() => String)
  async debug() {
    return "Debug";
  }
  @Mutation(() => Boolean)
  async Register(
    @Arg("name") name: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    const hashedPassword = await hash(password, 13);

    try {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
    } catch (err) {
      return false;
    }

    return true;
  }

  @Mutation(() => LoginResponse)
  async Login(@Arg("email") email: string, @Arg("password") password: string) {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new Error("Could not find user");
    }

    const verify = compare(password, user.password);

    if (!verify) {
      throw new Error("Bad password");
    }

    return {
      accessToken: sign({ userId: user.id }, "Bemol_API", {
        expiresIn: "150m",
      }),
    };
  }
}
