print('Started Adding the Users.');
db = db.getSiblingDB('admin');
db.createUser({
  user: 'admin',
  pwd: 'admin',
  roles: [
    {
      role: 'root',
      db: 'admin',
    },
  ],
});
print('End Adding the User Roles.');
