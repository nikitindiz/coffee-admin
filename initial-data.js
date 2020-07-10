const crypto = require('crypto');
const randomString = () => crypto.randomBytes(6).hexSlice();

module.exports = async keystone => {
  // Count existing users
  const {
    data: {
      _allUsersMeta: { count },
    },
  } = await keystone.executeGraphQL({
    query: `query {
      _allUsersMeta {
        count
      }
    }`,

    context: keystone.createContext({
      skipAccessControl: process.env.NODE_ENV !== 'production'
    }),
  });

  if (count === 0) {
    const password = randomString();
    const email = 'admin@example.com';

    await keystone.executeGraphQL({
      query: `mutation initialUser($password: String, $email: String) {
            createUser(data: {name: "Admin", email: $email, isAdmin: true, password: $password}) {
              id
            }
          }`,
      variables: { password, email },
      context: keystone.createContext({
        skipAccessControl: process.env.NODE_ENV !== 'production'
      })
    });

    console.log(`

User created:
  email: ${email}
  password: ${password}
Please change these details after initial login.
`);
  }
};
