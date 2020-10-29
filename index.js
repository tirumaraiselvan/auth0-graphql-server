const { ApolloServer, ApolloError } = require('apollo-server');
const { makeExecutableSchema } = require('graphql-tools');
const fetch = require('node-fetch');

const ADMIN_TOKEN = process.env.AUTH0_ADMIN_TOKEN;

const getUserFromAuth0 = async (auth0_id) => {
  if (!ADMIN_TOKEN) {
    throw new ApolloError("invalid admin token");
  }
  const options = {
    method: 'GET',
    headers: {
      "Authorization": 'Bearer ' + ADMIN_TOKEN
    }
  };
  const response = await fetch(
    'https://crossliftspro.auth0.com/api/v2/users',
    options
  );
  try {
    const respObj = await response.json();
    console.log(respObj);
    return respObj.find(u => u.user_id === auth0_id);
  } catch (e) {
    console.error(e);
    throw new ApolloError(e);
  }
}

const getUserFromAuth0Email = async (email) => {
  if (!ADMIN_TOKEN) {
    throw new ApolloError("invalid admin token");
  }
  const options = {
    method: 'GET',
    headers: {
      "Authorization": 'Bearer ' + ADMIN_TOKEN
    }
  };
  const response = await fetch(
    'https://crossliftspro.auth0.com/api/v2/users',
    options
  );
  try {
    const respObj = await response.json();
    console.log(respObj);
    return respObj.find(u => u.email === email);
  } catch (e) {
    console.error(e);
    throw new ApolloError(e);
  }
}

const typeDefs = `
  type Query {
    hello: String
    auth0 (auth0_id: String, email: String): Auth0Info
  }

  type Auth0Info {
    user_id: String,
    email: String,
    email_verified: Boolean,
    name: String,
    picture: String,
    nickname: String,
    created_at: String,
    last_login: String,
    logins_count: Int
  }
`;

const resolvers = {
  Query: {
    hello: () => "world",

    auth0: async (_, args) => {
      let response;
      try {
        if (args.auth0_id) {
          response = await getUserFromAuth0(args.auth0_id);
          
        } else {
          response = await getUserFromAuth0Email(args.email);          
        }
        return response;
      } catch (e) {
        throw e;
      }
    }
  }
}

const schema = makeExecutableSchema({typeDefs, resolvers});

const server = new ApolloServer({ schema, introspection: true, playground:true});

server.listen(process.env.PORT || 3000).then(({url}) => {
  console.log('Listening at ' + url);
});



